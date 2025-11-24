import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import type {
  Profile,
  ProfileVisibilitySettings,
  CreateProfileInput,
  UpdateProfileInput,
  UserWithProfile,
} from "@/lib/types";
import { profileSelectFull } from "@/lib/types/prisma-selects";

/**
 * 檢查欄位是否對查看者可見
 * Check if a field is visible to the viewer
 */
export function checkFieldVisibility(
  field: string,
  visibility: ProfileVisibilitySettings,
  viewerUserId: string | undefined,
  profileUserId: string
): boolean {
  // 自己查看自己的資料：總是可見
  // Own profile: always visible
  if (viewerUserId === profileUserId) {
    return true;
  }

  const fieldVisibility = visibility[field as keyof ProfileVisibilitySettings];

  // 如果沒有設定可見性，預設為public
  // If no visibility setting, default to public
  if (!fieldVisibility) {
    return true;
  }

  // public: 所有人可見
  if (fieldVisibility === "public") {
    return true;
  }

  // friends: 僅好友可見（未來實作，目前等同private）
  // friends: only friends can see (future implementation, currently same as private)
  if (fieldVisibility === "friends") {
    // TODO: 實作好友檢查邏輯
    // TODO: Implement friend check logic
    return false;
  }

  // private: 僅自己可見
  // private: only self can see
  if (fieldVisibility === "private") {
    return false;
  }

  return false;
}

/**
 * 根據可見性設定過濾Profile欄位
 * Filter Profile fields based on visibility settings
 */
export function filterProfileByVisibility(
  profile: Profile,
  viewerUserId?: string
): Profile {
  // 自己查看自己的資料：返回完整Profile
  // Own profile: return full Profile
  if (viewerUserId === profile.userId) {
    return profile;
  }

  const visibility =
    profile.visibility &&
    typeof profile.visibility === "object" &&
    !Array.isArray(profile.visibility) &&
    profile.visibility !== null
      ? (profile.visibility as ProfileVisibilitySettings)
      : {};
  const filteredProfile = { ...profile };

  // 檢查每個欄位的可見性
  // Check visibility for each field
  const fieldsToCheck = [
    "name",
    "nickname",
    "gender",
    "birthDate",
    "avatar",
    "height",
    "weight",
    "description",
    "record",
    "train_start",
    "stance",
    "gym",
  ];

  for (const field of fieldsToCheck) {
    if (
      !checkFieldVisibility(field, visibility, viewerUserId, profile.userId)
    ) {
      // 隱藏欄位設為null
      // Set hidden fields to null
      (filteredProfile as any)[field] = null;
    }
  }

  return filteredProfile;
}

/**
 * 取得Profile（根據可見性過濾）
 * Get Profile by userId with visibility filtering
 */
export async function getProfileByUserId(
  userId: string,
  viewerUserId?: string
): Promise<Profile | null> {
  return unstable_cache(
    async () => {
      const profile = await prisma.profile.findUnique({
        where: {
          userId,
          deletedAt: null, // 過濾軟刪除
        },
        select: profileSelectFull,
      });

      if (!profile) {
        return null;
      }

      // 轉換visibility JSON為物件
      // Convert visibility JSON to object
      const profileWithVisibility = {
        ...profile,
        visibility: (profile.visibility as ProfileVisibilitySettings) || {},
      } as Profile;

      // 根據可見性過濾
      // Filter by visibility
      return filterProfileByVisibility(profileWithVisibility, viewerUserId);
    },
    [`profile-${userId}-${viewerUserId || "public"}`],
    {
      tags: [`profile-${userId}`],
      revalidate: 300, // 5分鐘
    }
  )();
}

/**
 * 取得完整Profile（不進行可見性過濾，用於編輯頁面）
 * Get full Profile without visibility filtering (for edit page)
 */
export async function getProfileByUserIdForOwner(
  userId: string
): Promise<Profile | null> {
  "use cache";
  const profile = await prisma.profile.findUnique({
    where: {
      userId,
      deletedAt: null,
    },
    select: profileSelectFull,
  });

  if (!profile) {
    return null;
  }

  return {
    ...profile,
    visibility: (profile.visibility as ProfileVisibilitySettings) || {},
  } as Profile;
}

/**
 * 創建Profile
 * Create Profile
 */
export async function createProfile(
  userId: string,
  data: CreateProfileInput
): Promise<Profile> {
  // 預設可見性：所有欄位為public
  // Default visibility: all fields public
  const defaultVisibility: ProfileVisibilitySettings = {
    name: "public",
    nickname: "public",
    gender: "public",
    birthDate: "public",
    avatar: "public",
    height: "public",
    weight: "public",
    description: "public",
    record: "public",
    train_start: "public",
    stance: "public",
    gym: "public",
  };

  const profile = await prisma.profile.create({
    data: {
      userId,
      name: data.name,
      nickname: data.nickname || null,
      gender: data.gender || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      avatar: data.avatar || null,
      height: data.height || null,
      weight: data.weight || null,
      description: data.description || null,
      record: data.record || null,
      train_start: data.train_start || null,
      stance: data.stance || null,
      gym: data.gym || null,
      visibility: data.visibility || (defaultVisibility as any),
    },
    select: profileSelectFull,
  });

  // 清除快取
  // Clear cache
  revalidateTag(`profile-${userId}`, "max");

  return {
    ...profile,
    visibility:
      (profile.visibility as ProfileVisibilitySettings) || defaultVisibility,
  } as Profile;
}

/**
 * 更新Profile
 * Update Profile
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileInput
): Promise<Profile> {
  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.nickname !== undefined) updateData.nickname = data.nickname || null;
  if (data.gender !== undefined) updateData.gender = data.gender || null;
  if (data.birthDate !== undefined) {
    updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
  }
  if (data.avatar !== undefined) updateData.avatar = data.avatar || null;
  if (data.height !== undefined) updateData.height = data.height || null;
  if (data.weight !== undefined) updateData.weight = data.weight || null;
  if (data.description !== undefined)
    updateData.description = data.description || null;
  if (data.record !== undefined) updateData.record = data.record || null;
  if (data.train_start !== undefined)
    updateData.train_start = data.train_start || null;
  if (data.stance !== undefined) updateData.stance = data.stance || null;
  if (data.gym !== undefined) updateData.gym = data.gym || null;
  if (data.visibility !== undefined) updateData.visibility = data.visibility;

  const profile = await prisma.profile.update({
    where: { userId },
    data: updateData,
    select: profileSelectFull,
  });

  // 清除快取
  // Clear cache
  revalidateTag(`profile-${userId}`, "max");

  return {
    ...profile,
    visibility: (profile.visibility as ProfileVisibilitySettings) || {},
  } as Profile;
}

/**
 * 更新可見性設定
 * Update visibility settings
 */
export async function updateVisibility(
  userId: string,
  visibility: ProfileVisibilitySettings
): Promise<Profile> {
  const profile = await prisma.profile.update({
    where: { userId },
    data: { visibility: visibility as any },
    select: profileSelectFull,
  });

  // 清除快取
  // Clear cache
  revalidateTag(`profile-${userId}`, "max");

  return {
    ...profile,
    visibility: (profile.visibility as ProfileVisibilitySettings) || visibility,
  } as Profile;
}

/**
 * 軟刪除Profile
 * Soft delete Profile
 */
export async function softDeleteProfile(userId: string): Promise<Profile> {
  const profile = await prisma.profile.update({
    where: { userId },
    data: { deletedAt: new Date() },
    select: profileSelectFull,
  });

  // 清除快取
  // Clear cache
  revalidateTag(`profile-${userId}`, "max");

  return {
    ...profile,
    visibility: (profile.visibility as ProfileVisibilitySettings) || {},
  } as Profile;
}

/**
 * 恢復軟刪除的Profile
 * Restore soft-deleted Profile
 */
export async function restoreProfile(userId: string): Promise<Profile> {
  const profile = await prisma.profile.update({
    where: { userId },
    data: { deletedAt: null },
    select: profileSelectFull,
  });

  // 清除快取
  // Clear cache
  revalidateTag(`profile-${userId}`, "max");

  return {
    ...profile,
    visibility: (profile.visibility as ProfileVisibilitySettings) || {},
  } as Profile;
}

/**
 * 取得User + Profile組合（根據可見性過濾）
 * Get User + Profile combination with visibility filtering
 */
export async function getProfileWithUser(
  userId: string,
  viewerUserId?: string
): Promise<UserWithProfile | null> {
  "use cache";
  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      email: true,
      isAdmin: true,
      isBanned: true,
      points: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        where: { deletedAt: null },
        select: profileSelectFull,
      },
    },
  });

  if (!user || !user.profile) {
    return null;
  }

  const profileWithVisibility = {
    ...user.profile,
    visibility: (user.profile.visibility as ProfileVisibilitySettings) || {},
  } as Profile;

  const filteredProfile = filterProfileByVisibility(
    profileWithVisibility,
    viewerUserId
  );

  return {
    ...user,
    profile: filteredProfile,
  } as UserWithProfile;
}

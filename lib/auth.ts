import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { User } from "./types";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(payload: {
  id: string;
  userId: string;
  email: string;
}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as { id: string; userId: string; email: string };
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) return null;

  return await verifyToken(token.value);
}

export async function setSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) return null;

  // 使用 userId 查詢（因為 session 中包含 userId）
  // Use userId to query (because session contains userId)
  const user = await prisma.user.findUnique({
    where: { userId: session.userId },
    select: {
      id: true,
      userId: true,
      email: true,
      isAdmin: true,
      isBanned: true,
      profile: {
        select: {
          name: true,
          nickname: true,
          avatar: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    ...user,
    name: user.profile?.name || user.userId,
    nickname: user.profile?.nickname || null,
    avatar: user.profile?.avatar || null,
  } as User;
}

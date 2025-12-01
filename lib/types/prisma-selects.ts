/**
 * Prisma Select Schemas
 * Prisma 選擇模式定義
 *
 * 集中管理所有 Prisma select schemas，確保類型安全和查詢一致性
 * Centralized management of all Prisma select schemas for type safety and query consistency
 */

import { Prisma } from "@prisma/client";

// Profile Select Constants
export const profileSelectPublic = {
  id: true,
  userId: true,
  name: true,
  nickname: true,
  avatar: true,
} satisfies Prisma.ProfileSelect;

export const profileSelectFull = {
  id: true,
  userId: true,
  name: true,
  nickname: true,
  gender: true,
  birthDate: true,
  avatar: true,
  height: true,
  weight: true,
  description: true,
  record: true,
  train_start: true,
  stance: true,
  gym: true,
  visibility: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProfileSelect;

// Reusable Prisma Select Fragments
// 公開顯示用使用者資料（從Profile讀取，不包含敏感資訊）
export const userSelectPublic = {
  id: true,
  userId: true,
  profile: {
    select: profileSelectPublic,
  },
} satisfies Prisma.UserSelect;

// 公開顯示用使用者資料（擴展版，包含 email）
export const userSelectPublicExtended = {
  id: true,
  userId: true,
  email: true,
  profile: {
    select: profileSelectPublic,
  },
} satisfies Prisma.UserSelect;

// 完整使用者資料（所有欄位 + Profile）
export const userSelectFull = {
  id: true,
  userId: true,
  email: true,
  isAdmin: true,
  isBanned: true,
  points: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: profileSelectFull,
  },
} satisfies Prisma.UserSelect;

// 完整使用者資料 + 統計
// 注意：_count 不是 UserSelect 的一部分，所以這裡使用 any 來繞過類型檢查
export const userSelectWithStats = {
  ...userSelectFull,
  _count: {
    select: {
      posts: true,
      comments: true,
      likedPosts: true,
      likedComments: true,
    },
  },
} as any;

// 向後兼容：保留 userSelectBasic 作為 userSelectPublic 的別名
export const userSelectBasic = userSelectPublic;

// Category Select
export const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.CategorySelect;

// ============================================================================
// Event Select Schemas
// ============================================================================

/**
 * Event minimal select (只包含基本欄位，用於列表顯示)
 * Event minimal select (basic fields only, for list display)
 */
export const eventSelectMinimal = {
  id: true,
  name: true,
  fight_date: true,
  status: true,
  sport_type: true,
  createdAt: true,
} satisfies Prisma.EventSelect;

/**
 * Event public select (公開顯示用，包含詳細資訊)
 * Event public select (for public display, includes detailed info)
 */
export const eventSelectPublic = {
  id: true,
  name: true,
  fight_date: true,
  status: true,
  sport_type: true,
  promoter: true,
  organization: true,
  venue: true,
  location: true,
  description: true,
  poster_url: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EventSelect;

/**
 * Event full select (完整欄位，包含外部 API 整合欄位)
 * Event full select (all fields, including external API integration fields)
 */
export const eventSelectFull = {
  ...eventSelectPublic,
  external_id: true,
  external_source: true,
  external_data: true,
  last_synced_at: true,
  sync_status: true,
} satisfies Prisma.EventSelect;

/**
 * Event with fights select (包含對戰列表)
 * Event with fights select (includes fight list)
 */
export const eventSelectWithFights = {
  ...eventSelectFull,
  fights: {
    select: {
      id: true,
      fighter_id: true,
      opponent_id: true,
      fight_type: true,
      fight_order: true,
      weight_class: true,
      is_bettable: true,
      status: true,
      result: true,
      method: true,
      round: true,
      time: true,
      createdAt: true,
      updatedAt: true,
      fighter: {
        select: {
          id: true,
          slug: true,
          name: true,
          thumb: true,
          cutout: true,
          sport_type: true,
          nationality: true,
        },
      },
      opponent: {
        select: {
          id: true,
          slug: true,
          name: true,
          thumb: true,
          cutout: true,
          sport_type: true,
          nationality: true,
        },
      },
      _count: {
        select: {
          bets: true,
        },
      },
    },
    orderBy: {
      fight_order: "asc" as const,
    },
  },
  _count: {
    select: {
      bets: true,
      posts: true,
      fights: true,
    },
  },
} satisfies Prisma.EventSelect;

// ============================================================================
// Fight Select Schemas
// ============================================================================

/**
 * Fight minimal select (基本欄位)
 * Fight minimal select (basic fields)
 */
export const fightSelectMinimal = {
  id: true,
  event_id: true,
  fighter_id: true,
  opponent_id: true,
  fight_type: true,
  fight_order: true,
  status: true,
} satisfies Prisma.FightSelect;

/**
 * Fight public select (公開顯示用)
 * Fight public select (for public display)
 */
export const fightSelectPublic = {
  id: true,
  event_id: true,
  fighter_id: true,
  opponent_id: true,
  fight_type: true,
  fight_order: true,
  weight_class: true,
  is_bettable: true,
  status: true,
  result: true,
  method: true,
  round: true,
  time: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FightSelect;

/**
 * Fight full select (完整欄位)
 * Fight full select (all fields)
 */
export const fightSelectFull = {
  ...fightSelectPublic,
} satisfies Prisma.FightSelect;

/**
 * Fight with relations select (包含關聯資料)
 * Fight with relations select (includes related data)
 */
export const fightSelectWithRelations = {
  ...fightSelectPublic,
  event: {
    select: eventSelectPublic,
  },
  fighter: {
    select: {
      id: true,
      slug: true,
      name: true,
      thumb: true,
      cutout: true,
      sport_type: true,
      nationality: true,
    },
  },
  opponent: {
    select: {
      id: true,
      slug: true,
      name: true,
      thumb: true,
      cutout: true,
      sport_type: true,
      nationality: true,
    },
  },
  _count: {
    select: {
      bets: true,
    },
  },
} satisfies Prisma.FightSelect;

/**
 * Fight with full relations select (包含完整關聯資料)
 * Fight with full relations select (includes full related data)
 */
export const fightSelectWithFullRelations = {
  ...fightSelectPublic,
  event: {
    select: eventSelectPublic,
  },
  fighter: {
    select: {
      id: true,
      slug: true,
      name: true,
      external_id: true,
      external_source: true,
      external_data: true,
      sport_type: true,
      nationality: true,
      date_born: true,
      height: true,
      weight: true,
      position: true,
      description: true,
      thumb: true,
      cutout: true,
      last_synced_at: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  opponent: {
    select: {
      id: true,
      slug: true,
      name: true,
      external_id: true,
      external_source: true,
      external_data: true,
      sport_type: true,
      nationality: true,
      date_born: true,
      height: true,
      weight: true,
      position: true,
      description: true,
      thumb: true,
      cutout: true,
      last_synced_at: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  _count: {
    select: {
      bets: true,
    },
  },
} satisfies Prisma.FightSelect;

// ============================================================================
// Fighter Select Schemas
// ============================================================================

/**
 * Fighter minimal select (基本欄位，用於列表顯示)
 * Fighter minimal select (basic fields, for list display)
 */
export const fighterSelectMinimal = {
  id: true,
  slug: true,
  name: true,
} satisfies Prisma.FighterSelect;

/**
 * Fighter public select (公開顯示用)
 * Fighter public select (for public display)
 */
export const fighterSelectPublic = {
  id: true,
  slug: true,
  name: true,
  nationality: true,
  date_born: true,
  height: true,
  weight: true,
  position: true,
  description: true,
  thumb: true,
  cutout: true,
  sport_type: true,
  external_data: true,
  gender: true,
  titles: true,
} satisfies Prisma.FighterSelect;

/**
 * Fighter full select (完整欄位)
 * Fighter full select (all fields)
 */
export const fighterSelectFull = {
  id: true,
  slug: true,
  name: true,
  external_id: true,
  external_source: true,
  external_data: true,
  sport_type: true,
  nationality: true,
  date_born: true,
  height: true,
  weight: true,
  position: true,
  description: true,
  thumb: true,
  cutout: true,
  gender: true,
  titles: true,
  last_synced_at: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FighterSelect;

/**
 * Fighter with events select (包含對戰歷史)
 * Fighter with events select (includes fight history)
 */
export const fighterSelectWithEvents = {
  ...fighterSelectFull,
  fightsAsFighter: {
    select: {
      id: true,
      fighter_id: true,
      event_id: true,
      opponent_id: true,
      result: true,
      method: true,
      round: true,
      time: true,
      weight_class: true,
      createdAt: true,
      updatedAt: true,
      event: {
        select: eventSelectPublic,
      },
      fighter: {
        select: fighterSelectPublic,
      },
      opponent: {
        select: fighterSelectPublic,
      },
    },
    orderBy: {
      event: {
        fight_date: "desc" as const,
      },
    },
    take: 10,
  },
  fightsAsOpponent: {
    select: {
      id: true,
      fighter_id: true,
      event_id: true,
      opponent_id: true,
      result: true,
      method: true,
      round: true,
      time: true,
      weight_class: true,
      createdAt: true,
      updatedAt: true,
      event: {
        select: eventSelectPublic,
      },
      fighter: {
        select: fighterSelectPublic,
      },
      opponent: {
        select: fighterSelectPublic,
      },
    },
    orderBy: {
      event: {
        fight_date: "desc" as const,
      },
    },
    take: 10,
  },
} satisfies Prisma.FighterSelect;

// ============================================================================
// Post Select Schemas
// ============================================================================

/**
 * Post minimal select (基本欄位)
 * Post minimal select (basic fields)
 */
export const postSelectMinimal = {
  id: true,
  title: true,
  userId: true,
  createdAt: true,
} satisfies Prisma.PostSelect;

/**
 * Post public select (公開顯示用)
 * Post public select (for public display)
 */
export const postSelectPublic = {
  id: true,
  title: true,
  content: true,
  userId: true,
  tags: true,
  categoryId: true,
  eventId: true,
  views: true,
  likes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PostSelect;

/**
 * Post full select (完整欄位)
 * Post full select (all fields)
 */
export const postSelectFull = {
  ...postSelectPublic,
  deletedAt: true,
} satisfies Prisma.PostSelect;

/**
 * Post with user select (包含用戶資訊)
 * Post with user select (includes user info)
 */
export const postSelectWithUser = {
  ...postSelectPublic,
  user: {
    select: userSelectPublicExtended,
  },
  category: {
    select: categorySelect,
  },
  _count: {
    select: {
      comments: true,
    },
  },
} satisfies Prisma.PostSelect;

/**
 * Post with details select (包含完整詳情，用於詳細頁面)
 * Post with details select (includes full details, for detail page)
 */
export const postSelectWithDetails = {
  ...postSelectPublic,
  deletedAt: true, // 追加 deletedAt フィールド / Add deletedAt field
  user: {
    select: userSelectPublicExtended,
  },
  category: {
    select: categorySelect,
  },
  comments: {
    select: {
      id: true,
      content: true,
      userId: true,
      postId: true,
      parentId: true,
      likes: true,
      replies: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: userSelectPublicExtended,
      },
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  _count: {
    select: {
      comments: true,
    },
  },
} satisfies Prisma.PostSelect;

// ============================================================================
// Comment Select Schemas
// ============================================================================

/**
 * Comment minimal select (基本欄位)
 * Comment minimal select (basic fields)
 */
export const commentSelectMinimal = {
  id: true,
  content: true,
  userId: true,
  postId: true,
  createdAt: true,
} satisfies Prisma.CommentSelect;

/**
 * Comment public select (公開顯示用)
 * Comment public select (for public display)
 */
export const commentSelectPublic = {
  id: true,
  content: true,
  userId: true,
  postId: true,
  parentId: true,
  likes: true,
  replies: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CommentSelect;

/**
 * Comment full select (完整欄位)
 * Comment full select (all fields)
 */
export const commentSelectFull = {
  ...commentSelectPublic,
  deletedAt: true,
} satisfies Prisma.CommentSelect;

/**
 * Comment with user select (包含用戶資訊)
 * Comment with user select (includes user info)
 */
export const commentSelectWithUser = {
  ...commentSelectPublic,
  deletedAt: true, // 追加 deletedAt フィールド / Add deletedAt field
  user: {
    select: userSelectPublicExtended,
  },
} satisfies Prisma.CommentSelect;

/**
 * Comment with user and post select (包含用戶和貼文資訊)
 * Comment with user and post select (includes user and post info)
 */
export const commentSelectWithUserAndPost = {
  ...commentSelectPublic,
  user: {
    select: userSelectPublicExtended,
  },
  post: {
    select: {
      id: true,
      title: true,
    },
  },
} satisfies Prisma.CommentSelect;

// ============================================================================
// BettingLog Select Schemas
// ============================================================================

/**
 * BettingLog minimal select (基本欄位)
 * BettingLog minimal select (basic fields)
 */
export const bettingLogSelectMinimal = {
  id: true,
  userId: true,
  eventId: true,
  fightId: true,
  bet_amount: true,
  target_winner_id: true,
  settlement_status: true,
  createdAt: true,
} satisfies Prisma.BettingLogSelect;

/**
 * BettingLog full select (完整欄位)
 * BettingLog full select (all fields)
 */
export const bettingLogSelectFull = {
  id: true,
  userId: true,
  eventId: true,
  fightId: true,
  bet_amount: true,
  target_winner_id: true,
  odds_snapshot: true,
  is_winning_bet: true,
  final_payout: true,
  settlement_status: true,
  createdAt: true,
} satisfies Prisma.BettingLogSelect;

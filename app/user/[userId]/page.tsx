import { getSession } from "@/lib/auth";
import { getUserProfilePage } from "@/lib/services/users";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/features/post/components/post-card";
import { Settings } from "lucide-react";
import { prisma } from "@/lib/db";
import { BettingStatsCard } from "@/features/profile/components/betting-stats-card";
import { BettingHistoryList } from "@/features/profile/components/betting-history-list";
import { FollowButton } from "@/features/profile/components/follow-button";
import type {
  PostWithUser,
  UserProfilePage,
  UserBettingStats,
  BettingLog,
} from "@/lib/types";
import { t } from "@/lib/constants";

export default async function UserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const [session, userData] = await Promise.all([
    getSession(),
    getUserProfilePage(userId),
  ]);

  if (!userData) {
    notFound();
  }

  const user = userData as UserProfilePage;
  const profile = user.profile;

  const isOwnProfile = session?.userId === user.userId;

  // Fetch follower counts
  const [followersCount, followingCount, isFollowing] = await Promise.all([
    prisma.follows.count({ where: { followingId: user.userId } }),
    prisma.follows.count({ where: { followerId: user.userId } }),
    session
      ? prisma.follows.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.userId,
              followingId: user.userId,
            },
          },
        })
      : Promise.resolve(null),
  ]);

  // Fetch betting logs
  const bettingLogs = await prisma.bettingLog.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });

  // Fetch event names for logs
  const eventIds = [...new Set(bettingLogs.map((log) => log.eventId))];
  const events = await prisma.event.findMany({
    where: { id: { in: eventIds } },
    select: { id: true, name: true },
  });
  const eventMap = new Map(events.map((e) => [e.id, e.name]));

  // Calculate stats
  const stats: UserBettingStats = {
    totalBets: bettingLogs.length,
    wins: 0,
    losses: 0,
    pending: 0,
    voided: 0,
    totalWagered: 0,
    totalPayout: 0,
    netProfit: 0,
    roi: 0,
    winRate: 0,
  };

  bettingLogs.forEach((log) => {
    const amount = Number(log.bet_amount);
    stats.totalWagered += amount;

    if (log.settlement_status === "WON") {
      stats.wins++;
      const payout = amount * Number(log.odds_snapshot);
      stats.totalPayout += payout;
    } else if (log.settlement_status === "LOST") {
      stats.losses++;
    } else if (log.settlement_status === "PENDING") {
      stats.pending++;
    } else if (log.settlement_status === "VOID") {
      stats.voided++;
      stats.totalPayout += amount; // Refund
    }
  });

  stats.netProfit = stats.totalPayout - stats.totalWagered;

  // ROI calculation (only for settled bets: WON/LOST)
  const settledWagered = bettingLogs
    .filter(
      (l) => l.settlement_status === "WON" || l.settlement_status === "LOST"
    )
    .reduce((acc, l) => acc + Number(l.bet_amount), 0);

  if (settledWagered > 0) {
    const settledProfit = stats.totalPayout - stats.totalWagered; // Simplified for now, assumes pending/void handled correctly or ignored
    // Actually, netProfit includes pending wagers as negative if we just subtract totalWagered.
    // Correct ROI = (Net Profit on Settled Bets / Total Wagered on Settled Bets) * 100

    const profitOnSettled = bettingLogs
      .filter(
        (l) => l.settlement_status === "WON" || l.settlement_status === "LOST"
      )
      .reduce((acc, l) => {
        if (l.settlement_status === "WON") {
          return (
            acc +
            Number(l.bet_amount) * Number(l.odds_snapshot) -
            Number(l.bet_amount)
          );
        } else {
          return acc - Number(l.bet_amount);
        }
      }, 0);

    stats.roi = (profitOnSettled / settledWagered) * 100;
  }

  const settledBetsCount = stats.wins + stats.losses;
  if (settledBetsCount > 0) {
    stats.winRate = (stats.wins / settledBetsCount) * 100;
  }

  // Prepare logs with event names for display
  // Transform betting logs for display, preserving Decimal types
  // 轉換投注記錄供顯示，保留 Decimal 類型
  const logsWithNames = bettingLogs.map((log) => ({
    ...log,
    eventName: eventMap.get(log.eventId) || "Unknown Event",
    // Keep bet_amount and odds_snapshot as Decimal for type compatibility
    // 保留 bet_amount 和 odds_snapshot 為 Decimal 以保持類型兼容性
    bet_amount: log.bet_amount,
    odds_snapshot: log.odds_snapshot,
  })) as (BettingLog & { eventName?: string })[];

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={
                  typeof profile.avatar === "string"
                    ? profile.avatar
                    : profile.avatar
                    ? String(profile.avatar)
                    : undefined
                }
              />
              <AvatarFallback className="text-3xl">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">
                  {typeof profile.nickname === "string" && profile.nickname
                    ? profile.nickname
                    : profile.name}
                </h1>
                {user.isAdmin && <Badge variant="destructive">Admin</Badge>}
              </div>
              <p className="text-muted-foreground">@{user.userId}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <span className="font-bold">{followersCount}</span>
                  <span className="text-sm text-muted-foreground">
                    Followers
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold">{followingCount}</span>
                  <span className="text-sm text-muted-foreground">
                    Following
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {t("JOINED")}{" "}
                  {new Date(user.createdAt ?? "").toLocaleDateString()}
                </p>
                <Badge variant="secondary" className="text-sm">
                  {user.points ?? 0} {t("POINTS")}
                </Badge>
              </div>
            </div>

            {!isOwnProfile && session && (
              <FollowButton
                targetUserId={user.userId}
                initialIsFollowing={!!isFollowing}
              />
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link href={`/user/${user.userId}/posts`}>
              <div className="text-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                <p className="text-2xl font-bold">{user._count.posts}</p>
                <p className="text-sm text-muted-foreground">{t("POSTS")}</p>
              </div>
            </Link>
            <Link href={`/user/${user.userId}/comments`}>
              <div className="text-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                <p className="text-2xl font-bold">{user._count.comments}</p>
                <p className="text-sm text-muted-foreground">{t("COMMENTS")}</p>
              </div>
            </Link>
            <Link href={`/user/${user.userId}/likes`}>
              <div className="text-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                <p className="text-2xl font-bold">
                  {user._count.likedPosts + user._count.likedComments}
                </p>
                <p className="text-sm text-muted-foreground">{t("LIKES")}</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="about">{t("ABOUT")}</TabsTrigger>
          <TabsTrigger value="posts">{t("POSTS")}</TabsTrigger>
          <TabsTrigger value="betting">Betting</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl md:text-3xl font-bold">
                  {t("ABOUT")}
                </CardTitle>
                {isOwnProfile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/user/${user.userId}/edit`}>
                          <Settings className="size-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("EDIT_PROFILE")}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.name && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("NAME")}</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
              )}
              {profile.birthDate && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("BIRTHDAY")}
                  </p>
                  <p className="font-medium">
                    {new Date(profile.birthDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {profile.gender && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("GENDER")}</p>
                  <p className="font-medium">
                    {typeof profile.gender === "string"
                      ? profile.gender
                      : profile.gender
                      ? String(profile.gender)
                      : ""}
                  </p>
                </div>
              )}
              {profile.height && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("HEIGHT")}</p>
                  <p className="font-medium">
                    {typeof profile.height === "number"
                      ? profile.height
                      : typeof profile.height === "string"
                      ? profile.height
                      : profile.height
                      ? String(profile.height)
                      : ""}{" "}
                    cm
                  </p>
                </div>
              )}
              {profile.weight && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("WEIGHT")}</p>
                  <p className="font-medium">
                    {typeof profile.weight === "number"
                      ? profile.weight
                      : typeof profile.weight === "string"
                      ? profile.weight
                      : profile.weight
                      ? String(profile.weight)
                      : ""}{" "}
                    kg
                  </p>
                </div>
              )}
              {profile.description && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("DESCRIPTION")}
                  </p>
                  <p className="font-medium whitespace-pre-wrap">
                    {typeof profile.description === "string"
                      ? profile.description
                      : profile.description
                      ? String(profile.description)
                      : ""}
                  </p>
                </div>
              )}
              {profile.record && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("RECORD")}</p>
                  <p className="font-medium">
                    {typeof profile.record === "string"
                      ? profile.record
                      : profile.record
                      ? String(profile.record)
                      : ""}
                  </p>
                </div>
              )}
              {profile.train_start && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("TRAIN_START_YEAR")}
                  </p>
                  <p className="font-medium">
                    {typeof profile.train_start === "number"
                      ? profile.train_start
                      : typeof profile.train_start === "string"
                      ? profile.train_start
                      : profile.train_start
                      ? String(profile.train_start)
                      : ""}
                  </p>
                </div>
              )}
              {profile.stance && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("STANCE")}</p>
                  <p className="font-medium">
                    {typeof profile.stance === "string"
                      ? profile.stance
                      : profile.stance
                      ? String(profile.stance)
                      : ""}
                  </p>
                </div>
              )}
              {profile.gym && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("GYM")}</p>
                  <p className="font-medium">
                    {typeof profile.gym === "string"
                      ? profile.gym
                      : profile.gym
                      ? String(profile.gym)
                      : ""}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("MEMBER_SINCE")}
                </p>
                <p className="font-medium">
                  {new Date(user.createdAt ?? "").toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4 mt-8">
          {user.posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {t("NO_POSTS_YET")}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {user.posts.map((post) => (
                <PostCard key={post.id} post={post as PostWithUser} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="betting" className="space-y-8 mt-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="bg-primary/10 p-2 rounded-full text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-trophy"
                >
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </span>
              Performance Stats
            </h2>
            <BettingStatsCard stats={stats} />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Betting History</h2>
            <BettingHistoryList bets={logsWithNames} />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

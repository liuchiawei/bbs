import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { getFightWithDetails } from "@/lib/services/fights";
import { calculateFightOdds } from "@/lib/betting-system";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  MapPin,
  Clock,
  Trophy,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { FighterProfileHoverCard } from "@/features/fighter/components/fighter-profile-hover-card";
import { FighterAvatar } from "@/features/fighter/components/fighter-avatar";
import { getFighterRecentFights } from "@/lib/services/fights";

/**
 * Fight Detail Page
 * 對戰詳細頁面
 * Server Component with Next.js 16 optimizations
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const fight = await prisma.fight.findUnique({
    where: { id },
    include: {
      fighter: true,
      opponent: true,
      event: true,
    },
  });

  if (!fight || !fight.opponent) {
    return {
      title: "Fight Not Found",
    };
  }

  return {
    title: `${fight.fighter.name} vs ${fight.opponent.name} | Fight Details`,
    description: `${fight.fighter.name} vs ${fight.opponent.name} at ${fight.event.name}`,
    openGraph: {
      title: `${fight.fighter.name} vs ${fight.opponent.name}`,
      description: `Fight details for ${fight.event.name}`,
      type: "website",
    },
  };
}

export default async function FightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 獲取對戰詳細資料
  // Get fight details
  const fightData = await getFightWithDetails(id);

  if (!fightData || !fightData.opponent) {
    notFound();
  }

  // 計算賠率
  // Calculate odds
  let odds = null;
  if (fightData.is_bettable && fightData.status !== "COMPLETED") {
    try {
      odds = await calculateFightOdds(id);
    } catch (error) {
      console.error("Failed to calculate odds:", error);
    }
  }

  // 獲取選手最近對戰
  // Get fighter recent fights
  const [fighterRecentFights, opponentRecentFights] = await Promise.all([
    getFighterRecentFights(fightData.fighter_id, 5),
    fightData.opponent_id
      ? getFighterRecentFights(fightData.opponent_id, 5)
      : Promise.resolve([]),
  ]);

  const fightDate = new Date(fightData.event.fight_date);
  const formattedDate = fightDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = fightDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const fightTypeLabels = {
    MAIN: "主賽 / Main Event",
    CO_MAIN: "副賽 / Co-Main Event",
    PRELIMS: "預賽 / Prelims",
    EARLY_PRELIMS: "早期預賽 / Early Prelims",
  };

  const sportTypeColors: Record<string, string> = {
    boxing: "bg-red-500/20 text-red-500 border-red-500/50",
    ufc: "bg-purple-500/20 text-purple-500 border-purple-500/50",
    mma: "bg-orange-500/20 text-orange-500 border-orange-500/50",
    other: "bg-gray-500/20 text-gray-500 border-gray-500/50",
  };

  const getResultIcon = (result: string | null) => {
    if (!result) return <Minus className="w-4 h-4 text-muted-foreground" />;
    const resultLower = result.toLowerCase();
    if (resultLower.includes("win")) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    if (resultLower.includes("loss")) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs">
              {fightTypeLabels[fightData.fight_type]}
            </Badge>
            {fightData.weight_class && (
              <Badge variant="outline" className="text-xs">
                {fightData.weight_class}
              </Badge>
            )}
            {fightData.event.sport_type && (
              <Badge
                variant="outline"
                className={`text-xs ${
                  sportTypeColors[fightData.event.sport_type] ||
                  sportTypeColors.other
                }`}
              >
                {fightData.event.sport_type}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            <FighterProfileHoverCard
              fighterId={fightData.fighter.id}
              fighterName={fightData.fighter.name}
              fighterSlug={fightData.fighter.slug}
              fighterThumb={fightData.fighter.thumb}
              fighterNationality={fightData.fighter.nationality}
              fighterSportType={fightData.fighter.sport_type || undefined}
              preloadedStats={fightData.fighterStats}
              preloadedRecentFights={fighterRecentFights.map((f) => ({
                id: f.id,
                result: f.result,
                opponent: f.opponent
                  ? {
                      id: f.opponent.id,
                      name: f.opponent.name,
                      slug: f.opponent.slug || "",
                    }
                  : null,
                event: {
                  id: f.event.id,
                  name: f.event.name,
                  fight_date: f.event.fight_date,
                },
              }))}
              trigger={
                <span className="hover:text-primary transition-colors">
                  {fightData.fighter.name}
                </span>
              }
            />
            <span className="mx-4 text-muted-foreground">vs</span>
            <FighterProfileHoverCard
              fighterId={fightData.opponent.id}
              fighterName={fightData.opponent.name}
              fighterSlug={fightData.opponent.slug}
              fighterThumb={fightData.opponent.thumb}
              fighterNationality={fightData.opponent.nationality}
              fighterSportType={fightData.opponent.sport_type || undefined}
              preloadedStats={fightData.opponentStats || undefined}
              preloadedRecentFights={opponentRecentFights.map((f) => ({
                id: f.id,
                result: f.result,
                opponent: f.opponent
                  ? {
                      id: f.opponent.id,
                      name: f.opponent.name,
                      slug: f.opponent.slug || "",
                    }
                  : null,
                event: {
                  id: f.event.id,
                  name: f.event.name,
                  fight_date: f.event.fight_date,
                },
              }))}
              trigger={
                <span className="hover:text-primary transition-colors">
                  {fightData.opponent.name}
                </span>
              }
            />
          </h1>
        </div>

        {/* Event Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              賽事資訊 / Event Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Link
                  href={`/event/${fightData.event.id}`}
                  className="text-2xl font-bold hover:text-primary transition-colors"
                >
                  {fightData.event.name}
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{formattedTime}</span>
                </div>
                {fightData.event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{fightData.event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Betting Odds */}
        {odds && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>賠率 / Betting Odds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="font-bold text-lg mb-2">
                    {fightData.fighter.name}
                  </div>
                  <div className="text-2xl font-black text-primary">
                    {odds.odds[fightData.fighter.id]?.toFixed(2) || "1.00"}x
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    投注池:{" "}
                    {odds.betsByOutcome[fightData.fighter.id]?.toFixed(0) || 0}{" "}
                    PTS
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="font-bold text-lg mb-2">
                    {fightData.opponent.name}
                  </div>
                  <div className="text-2xl font-black text-primary">
                    {odds.odds[fightData.opponent.id]?.toFixed(2) || "1.00"}x
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    投注池:{" "}
                    {odds.betsByOutcome[fightData.opponent.id]?.toFixed(0) || 0}{" "}
                    PTS
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
                總投注池 / Total Pool: {odds.totalPool.toLocaleString()} PTS
                <br />
                淨池 / Net Pool: {odds.netPool.toLocaleString()} PTS
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fighter Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Fighter 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FighterAvatar
                  thumb={fightData.fighter.cutout || fightData.fighter.thumb}
                  name={fightData.fighter.name}
                  size="lg"
                />
                <div>
                  <FighterProfileHoverCard
                    fighterId={fightData.fighter.id}
                    fighterName={fightData.fighter.name}
                    fighterSlug={fightData.fighter.slug}
                    fighterThumb={fightData.fighter.thumb}
                    fighterNationality={fightData.fighter.nationality}
                    fighterSportType={fightData.fighter.sport_type || undefined}
                    preloadedStats={fightData.fighterStats}
                    preloadedRecentFights={fighterRecentFights.map((f) => ({
                      id: f.id,
                      result: f.result,
                      opponent: f.opponent
                        ? {
                            id: f.opponent.id,
                            name: f.opponent.name,
                            slug: f.opponent.slug || "",
                          }
                        : null,
                      event: {
                        id: f.event.id,
                        name: f.event.name,
                        fight_date: f.event.fight_date,
                      },
                    }))}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Statistics */}
              {fightData.fighterStats && (
                <div>
                  <h3 className="font-semibold mb-2">戰績 / Record</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-3 bg-green-500/10 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {fightData.fighterStats.wins}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        勝 / W
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-500/10 rounded">
                      <div className="text-2xl font-bold text-red-600">
                        {fightData.fighterStats.losses}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        負 / L
                      </div>
                    </div>
                    <div className="text-center p-3 bg-yellow-500/10 rounded">
                      <div className="text-2xl font-bold text-yellow-600">
                        {fightData.fighterStats.draws}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        平 / D
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-2xl font-bold">
                        {fightData.fighterStats.total}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        總 / Total
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Fights */}
              {fighterRecentFights.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">
                    最近對戰 / Recent Fights
                  </h3>
                  <div className="space-y-2">
                    {fighterRecentFights.map((fight) => (
                      <Link
                        key={fight.id}
                        href={`/fight/${fight.id}`}
                        className="flex items-center gap-3 p-2 bg-muted/50 rounded text-sm"
                      >
                        {getResultIcon(fight.result)}
                        <div className="flex-1">
                          <div className="font-medium">
                            {fight.opponent?.name || "TBD"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {fight.event.name}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(
                            fight.event.fight_date
                          ).toLocaleDateString()}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Fighter Info */}
              <div className="pt-4 border-t">
                <Link
                  href={`/fighter/${fightData.fighter.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  查看完整資料 / View Full Profile →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Fighter 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FighterAvatar
                  thumb={fightData.opponent.cutout || fightData.opponent.thumb}
                  name={fightData.opponent.name}
                  size="lg"
                />
                <div>
                  <FighterProfileHoverCard
                    fighterId={fightData.opponent.id}
                    fighterName={fightData.opponent.name}
                    fighterSlug={fightData.opponent.slug}
                    fighterThumb={fightData.opponent.thumb}
                    fighterNationality={fightData.opponent.nationality}
                    fighterSportType={
                      fightData.opponent.sport_type || undefined
                    }
                    preloadedStats={fightData.opponentStats || undefined}
                    preloadedRecentFights={opponentRecentFights.map((f) => ({
                      id: f.id,
                      result: f.result,
                      opponent: f.opponent
                        ? {
                            id: f.opponent.id,
                            name: f.opponent.name,
                            slug: f.opponent.slug || "",
                          }
                        : null,
                      event: {
                        id: f.event.id,
                        name: f.event.name,
                        fight_date: f.event.fight_date,
                      },
                    }))}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Statistics */}
              {fightData.opponentStats && (
                <div>
                  <h3 className="font-semibold mb-2">戰績 / Record</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-3 bg-green-500/10 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {fightData.opponentStats.wins}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        勝 / W
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-500/10 rounded">
                      <div className="text-2xl font-bold text-red-600">
                        {fightData.opponentStats.losses}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        負 / L
                      </div>
                    </div>
                    <div className="text-center p-3 bg-yellow-500/10 rounded">
                      <div className="text-2xl font-bold text-yellow-600">
                        {fightData.opponentStats.draws}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        平 / D
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="text-2xl font-bold">
                        {fightData.opponentStats.total}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        總 / Total
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Fights */}
              {opponentRecentFights.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">
                    最近對戰 / Recent Fights
                  </h3>
                  <div className="space-y-2">
                    {opponentRecentFights.map((fight) => (
                      <Link
                        key={fight.id}
                        href={`/fight/${fight.id}`}
                        className="flex items-center gap-3 p-2 bg-muted/50 rounded text-sm"
                      >
                        {getResultIcon(fight.result)}
                        <div className="flex-1">
                          <div className="font-medium">
                            {fight.opponent?.name || "TBD"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {fight.event.name}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(
                            fight.event.fight_date
                          ).toLocaleDateString()}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Fighter Info */}
              <div className="pt-4 border-t">
                <Link
                  href={`/fighter/${fightData.opponent.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  查看完整資料 / View Full Profile →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fight Result */}
        {fightData.status === "COMPLETED" && fightData.result && (
          <Card>
            <CardHeader>
              <CardTitle>對戰結果 / Fight Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg">
                <div className="font-bold mb-2">
                  {fightData.fighter.name} - {fightData.result}
                </div>
                {fightData.method && (
                  <div className="text-muted-foreground">
                    方式 / Method: {fightData.method}
                  </div>
                )}
                {fightData.round && (
                  <div className="text-muted-foreground">
                    回合 / Round: {fightData.round}
                  </div>
                )}
                {fightData.time && (
                  <div className="text-muted-foreground">
                    時間 / Time: {fightData.time}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

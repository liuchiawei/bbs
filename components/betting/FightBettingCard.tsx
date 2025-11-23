"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Trophy, Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import { FighterAvatar } from "@/components/fighters/fighter-avatar";
import { FighterProfileHoverCard } from "@/components/fighters/fighter-profile-hover-card";

interface BettingOdds {
  totalPool: number;
  netPool: number;
  odds: Record<string, number>;
  betsByOutcome: Record<string, number>;
}

interface Fighter {
  id: string;
  name: string;
  slug?: string;
  thumb?: string | null;
  cutout?: string | null;
  nationality?: string | null;
  sport_type?: string | null;
}

interface Fight {
  id: string;
  fighter: Fighter;
  opponent: Fighter | null;
  fightType: "MAIN" | "CO_MAIN" | "PRELIMS" | "EARLY_PRELIMS";
  fightOrder: number;
  weightClass?: string | null;
  isBettable: boolean;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  result?: string | null;
  method?: string | null;
  round?: number | null;
  time?: string | null;
  _count?: {
    bets: number;
  };
}

interface FightBettingCardProps {
  fight: Fight;
  userPoints: number;
  eventStatus: "PENDING" | "OPEN" | "CLOSED" | "SETTLED" | "CANCELLED";
}

const fightTypeLabels = {
  MAIN: "主賽 / Main Event",
  CO_MAIN: "副賽 / Co-Main Event",
  PRELIMS: "預賽 / Prelims",
  EARLY_PRELIMS: "早期預賽 / Early Prelims",
};

export function FightBettingCard({
  fight,
  userPoints,
  eventStatus,
}: FightBettingCardProps) {
  const [amount, setAmount] = useState<string>("");
  const [selectedWinner, setSelectedWinner] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [odds, setOdds] = useState<BettingOdds | null>(null);
  const [loadingOdds, setLoadingOdds] = useState(true);
  const router = useRouter();

  // 獲取對戰賠率
  // Fetch fight odds
  useEffect(() => {
    if (!fight.isBettable || fight.status === "COMPLETED" || fight.status === "CANCELLED") {
      setLoadingOdds(false);
      return;
    }

    const fetchOdds = async () => {
      try {
        const response = await fetch(`/api/fights/${fight.id}/odds`);
        if (response.ok) {
          const data = await response.json();
          setOdds(data);
        }
      } catch (error) {
        console.error("Failed to fetch odds:", error);
      } finally {
        setLoadingOdds(false);
      }
    };

    fetchOdds();
    // 每5秒更新一次賠率
    // Update odds every 5 seconds
    const interval = setInterval(fetchOdds, 5000);
    return () => clearInterval(interval);
  }, [fight.id, fight.isBettable, fight.status]);

  const adjustAmount = (delta: number) => {
    const current = Number(amount) || 0;
    const newAmount = Math.max(50, Math.min(userPoints, current + delta));
    // Round to nearest multiple of 10
    // 四捨五入到最接近的10的倍數
    const rounded = Math.round(newAmount / 10) * 10;
    setAmount(rounded.toString());
  };

  const handleBet = async () => {
    if (!selectedWinner) {
      toast.error("請選擇勝者 / Please select a winner");
      return;
    }
    const betAmount = Number(amount);
    if (!amount || isNaN(betAmount) || betAmount < 50) {
      toast.error("最小投注額為50點 / Minimum bet is 50 points");
      return;
    }
    if (betAmount % 10 !== 0) {
      toast.error("投注額必須是10的倍數 / Amount must be multiple of 10");
      return;
    }
    if (betAmount > userPoints) {
      toast.error("積分不足 / Insufficient points");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/betting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fightId: fight.id,
          target_winner_id: selectedWinner,
          amount: betAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "投注失敗 / Failed to place bet");
      }

      toast.success("投注成功！/ Bet placed successfully!");
      setAmount("");
      setSelectedWinner("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getOdds = (fighterId: string) => {
    if (!odds?.odds) return "1.00";
    return odds.odds[fighterId]?.toFixed(2) || "1.00";
  };

  const canBet =
    fight.isBettable &&
    fight.status !== "COMPLETED" &&
    fight.status !== "CANCELLED" &&
    (eventStatus === "OPEN" || eventStatus === "PENDING");

  if (!fight.opponent) {
    return (
      <Card className="w-full border-2 border-dashed border-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-sm">對戰資訊 / Fight Info</CardTitle>
          <CardDescription>
            {fight.fighter.name} - 對手待定 / Opponent TBD
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const outcomes = [
    { id: fight.fighter.id, name: fight.fighter.name },
    { id: fight.opponent.id, name: fight.opponent.name },
  ];

  return (
    <Card className="w-full border-2 border-dashed border-border bg-card/50 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />

      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {fightTypeLabels[fight.fightType]}
          </Badge>
          {fight.weightClass && (
            <Badge variant="outline" className="text-xs">
              {fight.weightClass}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="flex items-center justify-center gap-2 uppercase tracking-widest text-lg font-black">
            <Trophy className="w-5 h-5 text-accent" />
            Official Bet Slip
          </CardTitle>
          <Link
            href={`/fight/${fight.id}`}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            查看詳情 / View Details
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <CardDescription className="font-mono text-xs">
          FIGHT #{fight.fightOrder}
          <br />
          {loadingOdds ? (
            "載入中... / Loading..."
          ) : odds ? (
            <>POOL: {odds.totalPool.toLocaleString()} PTS</>
          ) : (
            "POOL: 0 PTS"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Fighters */}
          <div className="grid grid-cols-2 gap-4">
            {outcomes.map((outcome) => {
              const fighterData =
                outcome.id === fight.fighter.id ? fight.fighter : fight.opponent;
              return (
                <div
                  key={outcome.id}
                  onClick={() => canBet && setSelectedWinner(outcome.id)}
                  className={`cursor-pointer border-2 rounded-none p-4 text-center transition-all relative overflow-hidden group ${
                    selectedWinner === outcome.id
                      ? "border-primary bg-primary/5"
                      : canBet
                        ? "border-muted hover:border-primary/30"
                        : "border-muted opacity-50 cursor-not-allowed"
                  }`}
                >
                  {selectedWinner === outcome.id && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-primary transform rotate-45 translate-x-1.5 -translate-y-1.5" />
                  )}
                  {/* Fighter Avatar */}
                  <div className="flex justify-center mb-2">
                    <FighterAvatar
                      thumb={fighterData?.cutout || fighterData?.thumb}
                      name={outcome.name}
                      size="md"
                    />
                  </div>
                  <div className="font-black text-lg uppercase italic">
                    <FighterProfileHoverCard
                      fighterId={outcome.id}
                      fighterName={outcome.name}
                      fighterSlug={fighterData?.slug}
                      fighterThumb={fighterData?.thumb}
                      fighterNationality={fighterData?.nationality}
                      fighterSportType={fighterData?.sport_type || undefined}
                      trigger={
                        <span className="hover:text-primary transition-colors">
                          {outcome.name}
                        </span>
                      }
                    />
                  </div>
                  <div className="text-sm font-mono text-muted-foreground mt-1">
                    <span className="text-accent-foreground bg-accent px-1 rounded text-xs font-bold">
                      {loadingOdds ? "..." : `${getOdds(outcome.id)}x`}
                    </span>
                  </div>
                  {fight.result && fight.result === (outcome.id === fight.fighter.id ? "Win" : "Loss") && (
                    <Badge className="mt-2 bg-green-500">勝 / Winner</Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Betting Amount Input */}
          {canBet && (
            <div className="space-y-2 bg-muted/30 p-4 rounded-lg border border-border/50">
              <Label
                htmlFor={`amount-${fight.id}`}
                className="uppercase text-xs font-bold tracking-wider"
              >
                投注金額（點數）/ Wager Amount (Points)
              </Label>
              <div className="relative">
                <Input
                  id={`amount-${fight.id}`}
                  type="number"
                  placeholder="MIN 50"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (
                      value === "" ||
                      (!isNaN(Number(value)) && Number(value) >= 0)
                    ) {
                      setAmount(value);
                    }
                  }}
                  min={50}
                  max={userPoints}
                  step={10}
                  className="font-mono text-lg text-right pr-24 bg-background/50"
                />
                <div className="absolute right-3 top-2.5 text-xs font-mono text-muted-foreground">
                  BAL: {userPoints.toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => adjustAmount(-10)}
                  disabled={Number(amount) <= 50}
                  className="text-xs"
                >
                  -10
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => adjustAmount(10)}
                  disabled={Number(amount) >= userPoints}
                  className="text-xs"
                >
                  +10
                </Button>
              </div>
            </div>
          )}

          {/* Bet Summary */}
          {selectedWinner && amount && canBet && (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-none text-sm space-y-2 relative">
              <div className="absolute -left-1 top-1/2 w-2 h-4 bg-background rounded-r-full transform -translate-y-1/2" />
              <div className="absolute -right-1 top-1/2 w-2 h-4 bg-background rounded-l-full transform -translate-y-1/2" />

              <div className="flex justify-between items-center border-b border-dashed border-primary/20 pb-2">
                <span className="uppercase text-xs font-bold text-muted-foreground">
                  選擇 / Selection
                </span>
                <span className="font-black uppercase">
                  {outcomes.find((o) => o.id === selectedWinner)?.name}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="uppercase text-xs font-bold text-muted-foreground">
                  預計派彩 / Est. Payout
                </span>
                <span className="font-black text-xl text-primary">
                  {(Number(amount) * Number(getOdds(selectedWinner))).toFixed(0)}{" "}
                  <span className="text-xs align-top">PTS</span>
                </span>
              </div>
            </div>
          )}

          {/* Fight Result Display */}
          {fight.status === "COMPLETED" && fight.result && (
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <div className="text-sm space-y-1">
                <div className="font-bold">結果 / Result:</div>
                <div>
                  {fight.fighter.name} - {fight.result}
                  {fight.method && ` via ${fight.method}`}
                  {fight.round && ` (Round ${fight.round})`}
                  {fight.time && ` at ${fight.time}`}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {canBet && (
        <CardFooter>
          <Button
            className="w-full font-black uppercase tracking-widest text-lg h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
            onClick={handleBet}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                處理中... / PROCESSING...
              </>
            ) : (
              "確認投注 / CONFIRM WAGER"
            )}
          </Button>
        </CardFooter>
      )}
      {!canBet && fight.status !== "COMPLETED" && (
        <CardFooter>
          <div className="w-full text-center text-sm text-muted-foreground">
            投注已關閉 / Betting Closed
          </div>
        </CardFooter>
      )}
    </Card>
  );
}


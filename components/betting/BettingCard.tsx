"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Trophy } from "lucide-react";

interface PoolData {
  totalPool: number;
  netPool: number;
  odds: Record<string, number>;
  betsByOutcome: Record<string, number>;
}

interface Event {
  id: string;
  name: string;
  fight_date: string;
  status: "PENDING" | "OPEN" | "CLOSED" | "SETTLED" | "CANCELLED";
  poolData?: PoolData;
}

interface BettingCardProps {
  event: Event;
  userPoints: number;
}

export function BettingCard({ event, userPoints }: BettingCardProps) {
  const [amount, setAmount] = useState<string>("");
  const [selectedWinner, setSelectedWinner] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Parse fighters from event name (assuming "Fighter A vs Fighter B" format)
  // This is a simple heuristic, ideally we'd have separate fields for fighters
  const fighters = event.name.split(" vs ").map(s => s.trim());
  const fighterA = fighters[0] || "Home";
  const fighterB = fighters[1] || "Away";

  // Map fighter names to IDs (using name as ID for simplicity if no separate ID)
  // In a real app, we'd have fighter IDs. Here we use the names as target_winner_id
  const outcomes = [
    { id: fighterA, name: fighterA },
    { id: fighterB, name: fighterB },
  ];

  const handleBet = async () => {
    if (!selectedWinner) {
      toast.error("Please select a winner");
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) < 10) {
      toast.error("Minimum bet is 10 points");
      return;
    }
    if (Number(amount) > userPoints) {
      toast.error("Insufficient points");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/betting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          target_winner_id: selectedWinner,
          amount: Number(amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place bet");
      }

      toast.success("Bet placed successfully!");
      setAmount("");
      setSelectedWinner("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getOdds = (outcomeId: string) => {
    if (!event.poolData?.odds) return "1.00";
    return event.poolData.odds[outcomeId]?.toFixed(2) || "1.00";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Place Your Bet
        </CardTitle>
        <CardDescription>
          Current Pool: {event.poolData?.totalPool.toLocaleString()} pts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {outcomes.map((outcome) => (
              <div
                key={outcome.id}
                onClick={() => setSelectedWinner(outcome.id)}
                className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                  selectedWinner === outcome.id
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <div className="font-bold text-lg">{outcome.name}</div>
                <div className="text-sm text-muted-foreground">
                  Odds: {getOdds(outcome.id)}x
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Bet Amount (Points)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="Min 10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={10}
                max={userPoints}
              />
              <div className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                Balance: {userPoints.toLocaleString()}
              </div>
            </div>
          </div>

          {selectedWinner && amount && (
            <div className="bg-muted p-3 rounded-md text-sm space-y-1">
              <div className="flex justify-between">
                <span>Potential Win:</span>
                <span className="font-bold text-green-600">
                  {(Number(amount) * Number(getOdds(selectedWinner))).toFixed(0)} pts
                </span>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                *Odds are dynamic and final payout depends on pool at close.
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleBet} 
          disabled={isLoading || event.status !== "OPEN"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing Bet...
            </>
          ) : event.status !== "OPEN" ? (
            "Betting Closed"
          ) : (
            "Place Bet"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

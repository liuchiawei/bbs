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
  const fighters = event.name.split(" vs ").map(s => s.trim());
  const fighterA = fighters[0] || "Home";
  const fighterB = fighters[1] || "Away";

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
    <Card className="w-full max-w-md mx-auto border-2 border-dashed border-border bg-card/50 shadow-xl relative overflow-hidden">
      {/* Receipt jagged edge effect could go here with CSS clip-path if desired */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
      
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-2 uppercase tracking-widest text-lg font-black">
          <Trophy className="w-5 h-5 text-accent" />
          Official Bet Slip
        </CardTitle>
        <CardDescription className="font-mono text-xs">
          EVENT ID: {event.id.slice(0, 8).toUpperCase()}
          <br />
          POOL: {event.poolData?.totalPool.toLocaleString()} PTS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {outcomes.map((outcome) => (
              <div
                key={outcome.id}
                onClick={() => setSelectedWinner(outcome.id)}
                className={`cursor-pointer border-2 rounded-none p-4 text-center transition-all relative overflow-hidden group ${
                  selectedWinner === outcome.id
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/30"
                }`}
              >
                {selectedWinner === outcome.id && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-primary transform rotate-45 translate-x-1.5 -translate-y-1.5" />
                )}
                <div className="font-black text-lg uppercase italic">{outcome.name}</div>
                <div className="text-sm font-mono text-muted-foreground mt-1">
                  <span className="text-accent-foreground bg-accent px-1 rounded text-xs font-bold">
                    {getOdds(outcome.id)}x
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 bg-muted/30 p-4 rounded-lg border border-border/50">
            <Label htmlFor="amount" className="uppercase text-xs font-bold tracking-wider">Wager Amount (Points)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="MIN 10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={10}
                max={userPoints}
                className="font-mono text-lg text-right pr-24 bg-background/50"
              />
              <div className="absolute right-3 top-2.5 text-xs font-mono text-muted-foreground">
                BAL: {userPoints.toLocaleString()}
              </div>
            </div>
          </div>

          {selectedWinner && amount && (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-none text-sm space-y-2 relative">
              <div className="absolute -left-1 top-1/2 w-2 h-4 bg-background rounded-r-full transform -translate-y-1/2" />
              <div className="absolute -right-1 top-1/2 w-2 h-4 bg-background rounded-l-full transform -translate-y-1/2" />
              
              <div className="flex justify-between items-center border-b border-dashed border-primary/20 pb-2">
                <span className="uppercase text-xs font-bold text-muted-foreground">Selection</span>
                <span className="font-black uppercase">{outcomes.find(o => o.id === selectedWinner)?.name}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="uppercase text-xs font-bold text-muted-foreground">Est. Payout</span>
                <span className="font-black text-xl text-primary">
                  {(Number(amount) * Number(getOdds(selectedWinner))).toFixed(0)} <span className="text-xs align-top">PTS</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full font-black uppercase tracking-widest text-lg h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" 
          onClick={handleBet} 
          disabled={isLoading || event.status !== "OPEN"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              PROCESSING...
            </>
          ) : event.status !== "OPEN" ? (
            "BETTING CLOSED"
          ) : (
            "CONFIRM WAGER"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

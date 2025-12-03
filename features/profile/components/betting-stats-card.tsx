import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { UserBettingStats } from "@/lib/types";

interface BettingStatsCardProps {
  stats: UserBettingStats;
}

export function BettingStatsCard({ stats }: BettingStatsCardProps) {
  const isProfitable = stats.netProfit >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isProfitable ? "text-green-600" : "text-red-600"}`}>
            {isProfitable ? "+" : ""}{stats.netProfit.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Total Payout: {stats.totalPayout.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.wins} Wins / {stats.losses} Losses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ROI</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
            {stats.roi >= 0 ? "+" : ""}{stats.roi.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Return on Investment
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Wagered</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalWagered.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Across {stats.totalBets} bets
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

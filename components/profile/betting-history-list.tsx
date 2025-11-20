import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BettingLog } from "@/lib/types";
// import { formatDistanceToNow } from "date-fns";

interface BettingHistoryListProps {
  bets: (BettingLog & { eventName?: string })[];
}

export function BettingHistoryList({ bets }: BettingHistoryListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "WON":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "LOST":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "VOID":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  if (bets.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No betting history available.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Selection</TableHead>
            <TableHead>Odds</TableHead>
            <TableHead>Wager</TableHead>
            <TableHead>Result</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bets.map((bet) => (
            <TableRow key={bet.id}>
              <TableCell className="font-medium">
                {bet.eventName || bet.eventId.slice(0, 8)}
              </TableCell>
              <TableCell>{bet.target_winner_id}</TableCell>
              <TableCell>{Number(bet.odds_snapshot).toFixed(2)}x</TableCell>
              <TableCell>{Number(bet.bet_amount).toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(bet.settlement_status)}>
                  {bet.settlement_status}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {/* TODO: formatDistanceToNow is not working, use toLocaleString instead */}
                {/* {formatDistanceToNow(new Date(bet.createdAt), { addSuffix: true })} */}
                {new Date(bet.createdAt).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

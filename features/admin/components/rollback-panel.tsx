"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  name: string;
  status: "PENDING" | "OPEN" | "CLOSED" | "SETTLED" | "CANCELLED";
}

interface Bet {
  id: string;
  userId: string;
  eventId: string;
  bet_amount: number;
  target_winner_id: string;
  settlement_status: "PENDING" | "WON" | "LOST" | "VOID";
  final_payout?: number | null;
  createdAt: string;
}

export function RollbackPanel() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState<string | null>(null);
  const [rollbackBetId, setRollbackBetId] = useState<string | null>(null);
  const [rollbackEventId, setRollbackEventId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchBets(selectedEventId);
    } else {
      setBets([]);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        toast.error("Failed to load events");
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBets = async (eventId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/betting/${eventId}/bets`);
      if (response.ok) {
        const data = await response.json();
        setBets(data);
      } else {
        // If endpoint doesn't exist, try alternative
        toast.error("Failed to load bets");
      }
    } catch (error) {
      console.error("Failed to fetch bets:", error);
      // Silently fail - bets endpoint might not exist yet
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollbackBet = async () => {
    if (!rollbackBetId) return;

    setIsRollingBack(rollbackBetId);
    try {
      const response = await fetch(`/api/admin/betting/${rollbackBetId}/rollback`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to rollback bet");
      }

      toast.success("Bet rolled back successfully!");
      setRollbackBetId(null);
      if (selectedEventId) {
        fetchBets(selectedEventId);
      }
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to rollback bet");
    } finally {
      setIsRollingBack(null);
    }
  };

  const handleRollbackEvent = async () => {
    if (!rollbackEventId) return;

    setIsRollingBack(rollbackEventId);
    try {
      const response = await fetch(`/api/admin/events/${rollbackEventId}/rollback`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to rollback event");
      }

      toast.success("Event rolled back successfully!");
      setRollbackEventId(null);
      setSelectedEventId("");
      setBets([]);
      fetchEvents();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to rollback event");
    } finally {
      setIsRollingBack(null);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const canRollbackEvent = selectedEvent?.status === "SETTLED";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Rollback Management</CardTitle>
          <CardDescription>Rollback individual bets or entire events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Event</label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name} ({event.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canRollbackEvent && (
            <Button
              variant="destructive"
              onClick={() => setRollbackEventId(selectedEventId)}
              disabled={isRollingBack === selectedEventId}
            >
              {isRollingBack === selectedEventId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rolling back...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Rollback Entire Event
                </>
              )}
            </Button>
          )}

          {selectedEventId && bets.length > 0 && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Bet Amount</TableHead>
                    <TableHead>Target Winner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bets.map((bet) => (
                    <TableRow key={bet.id}>
                      <TableCell>{bet.userId}</TableCell>
                      <TableCell>{bet.bet_amount}</TableCell>
                      <TableCell>{bet.target_winner_id}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            bet.settlement_status === "WON"
                              ? "default"
                              : bet.settlement_status === "LOST"
                              ? "destructive"
                              : bet.settlement_status === "VOID"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {bet.settlement_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{bet.final_payout || "-"}</TableCell>
                      <TableCell>
                        {bet.settlement_status === "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRollbackBetId(bet.id)}
                            disabled={isRollingBack === bet.id}
                          >
                            {isRollingBack === bet.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Rollback"
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedEventId && bets.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">No bets found for this event</p>
          )}
        </CardContent>
      </Card>

      {/* Rollback Bet Dialog */}
      <AlertDialog open={!!rollbackBetId} onOpenChange={(open) => !open && setRollbackBetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rollback Bet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to rollback this bet? The user's points will be restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRollbackBet}>Rollback</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rollback Event Dialog */}
      <AlertDialog open={!!rollbackEventId} onOpenChange={(open) => !open && setRollbackEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rollback Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to rollback all bets for this event? All user points will be restored and the event status will be reset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRollbackEvent}>Rollback Event</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


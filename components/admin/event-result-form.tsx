"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  name: string;
  fight_date: string;
  status: "PENDING" | "OPEN" | "CLOSED" | "SETTLED" | "CANCELLED";
  fighter_1_id: string;
  fighter_2_id: string;
  winner_id?: string | null;
}

export function EventResultForm() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [winnerId, setWinnerId] = useState<string>("");
  const [winMethod, setWinMethod] = useState<string>("");
  const [winRound, setWinRound] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      // Fetch all events and filter client-side
      // すべてのイベントを取得し、クライアント側でフィルタリング
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.filter((e: Event) => e.status === "OPEN" || e.status === "CLOSED"));
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

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEventId || !winnerId) {
      toast.error("Please select an event and winner");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/events/${selectedEventId}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winnerId,
          winMethod: winMethod || undefined,
          winRound: winRound ? parseInt(winRound) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to settle event");
      }

      toast.success("Event settled successfully!");
      setSelectedEventId("");
      setWinnerId("");
      setWinMethod("");
      setWinRound("");
      router.refresh();
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || "Failed to settle event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Result Input</CardTitle>
        <CardDescription>Manually input event results and settle bets</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event">Select Event</Label>
            <Select
              value={selectedEventId}
              onValueChange={(value) => {
                setSelectedEventId(value);
                setWinnerId("");
              }}
              disabled={isLoading}
            >
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

          {selectedEvent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="winner">Winner</Label>
                <Select value={winnerId} onValueChange={setWinnerId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select winner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={selectedEvent.fighter_1_id}>
                      Fighter 1
                    </SelectItem>
                    <SelectItem value={selectedEvent.fighter_2_id}>
                      Fighter 2
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="winMethod">Win Method (Optional)</Label>
                <Input
                  id="winMethod"
                  value={winMethod}
                  onChange={(e) => setWinMethod(e.target.value)}
                  placeholder="e.g., KO, TKO, Decision"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="winRound">Win Round (Optional)</Label>
                <Input
                  id="winRound"
                  type="number"
                  min="1"
                  value={winRound}
                  onChange={(e) => setWinRound(e.target.value)}
                  placeholder="Round number"
                />
              </div>
            </>
          )}

          <Button type="submit" disabled={isSubmitting || !selectedEventId || !winnerId}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Settling...
              </>
            ) : (
              "Settle Event"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


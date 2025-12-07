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

interface Fighter {
  id: string;
  name: string;
}

interface MainFight {
  id: string;
  fighter_id: string;
  opponent_id: string;
  fighter: Fighter;
  opponent: Fighter;
}

interface Event {
  id: string;
  name: string;
  fight_date: string;
  status: "OPEN" | "CLOSED";
  mainFight: MainFight | null;
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
      // 使用優化的管理員專用 API 端點
      // Use optimized admin-specific API endpoint
      const response = await fetch("/api/admin/events/settlable");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        toast.error(errorData.error || "Failed to load events");
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const selectedFight = selectedEvent?.mainFight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEventId || !winnerId || !selectedFight) {
      toast.error("Please select an event and winner");
      return;
    }

    setIsSubmitting(true);
    try {
      // 使用新的對戰結算 API（基於 Fight）
      // Use new fight settlement API (based on Fight)
      const response = await fetch(`/api/admin/fights/${selectedFight.id}/result`, {
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
        throw new Error(data.error || "Failed to settle fight");
      }

      toast.success("Fight settled successfully!");
      setSelectedEventId("");
      setWinnerId("");
      setWinMethod("");
      setWinRound("");
      router.refresh();
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || "Failed to settle fight");
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

          {selectedEvent && selectedFight ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="winner">Winner</Label>
                <Select value={winnerId} onValueChange={setWinnerId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select winner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={selectedFight.fighter_id}>
                      {selectedFight.fighter.name}
                    </SelectItem>
                    <SelectItem value={selectedFight.opponent_id}>
                      {selectedFight.opponent.name}
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
          ) : selectedEvent && !selectedFight ? (
            <div className="text-sm text-muted-foreground">
              This event has no fights yet. Please add fights to the event first.
            </div>
          ) : null}

          <Button 
            type="submit" 
            disabled={isSubmitting || !selectedEventId || !winnerId || !selectedFight}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Settling...
              </>
            ) : (
              "Settle Fight"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


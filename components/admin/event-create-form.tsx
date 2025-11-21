"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { FightFormItem } from "./fight-form-item";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Fight {
  fighterId: string;
  opponentId: string;
  fightType: "MAIN" | "CO_MAIN" | "PRELIMS" | "EARLY_PRELIMS";
  fightOrder: number;
  weightClass?: string;
  isBettable?: boolean;
}

export function EventCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event basic info
  const [name, setName] = useState("");
  const [fightDate, setFightDate] = useState("");
  const [sportType, setSportType] = useState("");
  const [promoter, setPromoter] = useState("");
  const [organization, setOrganization] = useState("");
  const [venue, setVenue] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [status, setStatus] = useState<"PENDING" | "OPEN" | "CLOSED" | "SETTLED" | "CANCELLED">("PENDING");

  // Fights
  const [fights, setFights] = useState<Fight[]>([
    {
      fighterId: "",
      opponentId: "",
      fightType: "MAIN",
      fightOrder: 1,
      isBettable: true,
    },
  ]);

  const addFight = () => {
    setFights([
      ...fights,
      {
        fighterId: "",
        opponentId: "",
        fightType: "PRELIMS",
        fightOrder: fights.length + 1,
        isBettable: true,
      },
    ]);
  };

  const updateFight = (index: number, updates: Partial<Fight>) => {
    const newFights = [...fights];
    newFights[index] = { ...newFights[index], ...updates };
    setFights(newFights);
  };

  const removeFight = (index: number) => {
    if (fights.length <= 1) {
      toast.error("至少需要一場對戰 / At least one fight is required");
      return;
    }
    const newFights = fights.filter((_, i) => i !== index);
    // 重新編號對戰順序
    // Renumber fight orders
    setFights(
      newFights.map((fight, i) => ({
        ...fight,
        fightOrder: i + 1,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 驗證
    // Validation
    if (!name.trim()) {
      toast.error("請輸入賽事名稱 / Please enter event name");
      return;
    }

    if (!fightDate) {
      toast.error("請選擇賽事日期 / Please select event date");
      return;
    }

    if (fights.length === 0) {
      toast.error("至少需要一場對戰 / At least one fight is required");
      return;
    }

    for (let i = 0; i < fights.length; i++) {
      const fight = fights[i];
      if (!fight.fighterId || !fight.opponentId) {
        toast.error(`對戰 #${fight.fightOrder} 必須選擇兩位選手 / Fight #${fight.fightOrder} must have both fighters`);
        return;
      }
      if (fight.fighterId === fight.opponentId) {
        toast.error(`對戰 #${fight.fightOrder} 的兩位選手不能相同 / Fight #${fight.fightOrder} fighters must be different`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          fight_date: new Date(fightDate).toISOString(),
          sport_type: sportType || undefined,
          promoter: promoter || undefined,
          organization: organization || undefined,
          venue: venue || undefined,
          location: location || undefined,
          description: description || undefined,
          poster_url: posterUrl || undefined,
          status,
          fights: fights.map((fight) => ({
            fighterId: fight.fighterId,
            opponentId: fight.opponentId,
            fightType: fight.fightType,
            fightOrder: fight.fightOrder,
            weightClass: fight.weightClass,
            isBettable: fight.isBettable,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "創建賽事失敗 / Failed to create event");
      }

      toast.success("賽事創建成功！/ Event created successfully!");
      router.refresh();
      
      // 重置表單
      // Reset form
      setName("");
      setFightDate("");
      setSportType("");
      setPromoter("");
      setOrganization("");
      setVenue("");
      setLocation("");
      setDescription("");
      setPosterUrl("");
      setStatus("PENDING");
      setFights([
        {
          fighterId: "",
          opponentId: "",
          fightType: "MAIN",
          fightOrder: 1,
          isBettable: true,
        },
      ]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>創建賽事 / Create Event</CardTitle>
        <CardDescription>
          創建新的格鬥賽事並添加對戰組合 / Create a new combat sports event and add fights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">賽事基本信息 / Event Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  賽事名稱 / Event Name
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：UFC 300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fight-date">
                  賽事日期時間 / Event Date & Time
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="fight-date"
                  type="datetime-local"
                  value={fightDate}
                  onChange={(e) => setFightDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sport-type">運動類型 / Sport Type</Label>
                <Select value={sportType} onValueChange={setSportType}>
                  <SelectTrigger id="sport-type">
                    <SelectValue placeholder="選擇運動類型 / Select sport type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boxing">Boxing</SelectItem>
                    <SelectItem value="ufc">UFC</SelectItem>
                    <SelectItem value="mma">MMA</SelectItem>
                    <SelectItem value="muay-thai">Muay Thai</SelectItem>
                    <SelectItem value="kickboxing">Kickboxing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">狀態 / Status</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="OPEN">OPEN</SelectItem>
                    <SelectItem value="CLOSED">CLOSED</SelectItem>
                    <SelectItem value="SETTLED">SETTLED</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="promoter">推廣單位 / Promoter</Label>
                <Input
                  id="promoter"
                  value={promoter}
                  onChange={(e) => setPromoter(e.target.value)}
                  placeholder="例如：TopRank, UFC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">聯盟品牌 / Organization</Label>
                <Input
                  id="organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="例如：UFC, WBC"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue">場地 / Venue</Label>
                <Input
                  id="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="場地名稱"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">地點 / Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="城市、國家"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">賽事簡介 / Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="賽事簡介..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poster-url">海報URL / Poster URL</Label>
              <Input
                id="poster-url"
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://example.com/poster.jpg"
              />
            </div>
          </div>

          {/* Fights Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">對戰列表 / Fights</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFight}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                添加對戰 / Add Fight
              </Button>
            </div>

            <div className="space-y-4">
              {fights.map((fight, index) => (
                <FightFormItem
                  key={index}
                  fight={fight}
                  index={index}
                  sportType={sportType}
                  onUpdate={updateFight}
                  onRemove={removeFight}
                  canRemove={fights.length > 1}
                />
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                創建中... / Creating...
              </>
            ) : (
              "創建賽事 / Create Event"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


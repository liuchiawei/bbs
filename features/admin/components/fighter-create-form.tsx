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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/utils/slug";

export function FighterCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fighter basic info
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false); // 追蹤 slug 是否被手動編輯
  const [sportType, setSportType] = useState("");
  const [nationality, setNationality] = useState("");
  const [dateBorn, setDateBorn] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [thumb, setThumb] = useState("");
  const [cutout, setCutout] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE"); // 性別 / Gender
  const [titlesInput, setTitlesInput] = useState(""); // 頭銜輸入（逗號分隔） / Titles input (comma-separated)

  // 當 name 改變時自動生成 slug 預覽（僅在 slug 未被手動編輯時）
  // Auto-generate slug preview when name changes (only if slug hasn't been manually edited)
  useEffect(() => {
    if (name.trim() && !slugManuallyEdited) {
      const generatedSlug = generateSlug(name);
      setSlug(generatedSlug);
    }
  }, [name, slugManuallyEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 驗證
    // Validation
    if (!name.trim()) {
      toast.error("請輸入選手名稱 / Please enter fighter name");
      return;
    }

    // URL 格式驗證
    // URL format validation
    if (thumb && thumb.trim() !== "") {
      try {
        new URL(thumb);
      } catch {
        toast.error("Thumb URL 格式不正確 / Invalid thumb URL format");
        return;
      }
    }

    if (cutout && cutout.trim() !== "") {
      try {
        new URL(cutout);
      } catch {
        toast.error("Cutout URL 格式不正確 / Invalid cutout URL format");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/fighters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          sport_type: sportType || undefined,
          nationality: nationality.trim() || undefined,
          date_born: dateBorn || undefined,
          height: height.trim() || undefined,
          weight: weight.trim() || undefined,
          position: position.trim() || undefined,
          description: description.trim() || undefined,
          thumb: thumb.trim() || undefined,
          cutout: cutout.trim() || undefined,
          gender: gender,
          titles: titlesInput.trim()
            ? titlesInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "創建選手失敗 / Failed to create fighter");
      }

      toast.success("選手創建成功！/ Fighter created successfully!");
      router.refresh();
      
      // 重置表單
      // Reset form
      setName("");
      setSlug("");
      setSlugManuallyEdited(false);
      setSportType("");
      setNationality("");
      setDateBorn("");
      setHeight("");
      setWeight("");
      setPosition("");
      setDescription("");
      setThumb("");
      setCutout("");
      setGender("MALE");
      setTitlesInput("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>創建選手 / Create Fighter</CardTitle>
        <CardDescription>
          創建新的格鬥選手資料 / Create a new combat sports fighter profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">基本信息 / Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  選手名稱 / Fighter Name
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    // slug 會通過 useEffect 自動更新
                    // slug will be auto-updated via useEffect
                  }}
                  placeholder="例如：Conor McGregor"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug (URL-friendly)
                  <span className="text-xs text-muted-foreground ml-2">
                    (自動生成 / Auto-generated)
                  </span>
                </Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true); // 標記為手動編輯
                  }}
                  placeholder="例如：conor-mcgregor"
                />
                <p className="text-xs text-muted-foreground">
                  預覽：/fighter/{slug || "slug"}
                </p>
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
                <Label htmlFor="gender">性別 / Gender</Label>
                <Select value={gender} onValueChange={(value: "MALE" | "FEMALE" | "OTHER") => setGender(value)}>
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">男性 / Male</SelectItem>
                    <SelectItem value="FEMALE">女性 / Female</SelectItem>
                    <SelectItem value="OTHER">其他 / Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nationality">國籍 / Nationality</Label>
                <Input
                  id="nationality"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="例如：Ireland, USA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="titles">頭銜 / Titles</Label>
                <Input
                  id="titles"
                  value={titlesInput}
                  onChange={(e) => setTitlesInput(e.target.value)}
                  placeholder="例如：UFC Lightweight Champion, Interim Champion"
                />
                <p className="text-xs text-muted-foreground">
                  多個頭銜請用逗號分隔 / Separate multiple titles with commas
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-born">出生日期 / Date of Birth</Label>
              <Input
                id="date-born"
                type="date"
                value={dateBorn}
                onChange={(e) => setDateBorn(e.target.value)}
              />
            </div>
          </div>

          {/* Physical Data */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">身體數據 / Physical Data</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">
                  身高 / Height
                  <span className="text-xs text-muted-foreground ml-2">(公分/cm)</span>
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  min="0"
                  step="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">
                  體重 / Weight
                  <span className="text-xs text-muted-foreground ml-2">(磅/lb)</span>
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="155"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">量級/位置 / Weight Class/Position</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="例如：Lightweight, Middleweight"
              />
            </div>
          </div>

          {/* Description and Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">描述和圖片 / Description and Images</h3>
            
            <div className="space-y-2">
              <Label htmlFor="description">選手簡介 / Biography</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="選手簡介..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="thumb">頭像URL / Thumbnail URL</Label>
                <Input
                  id="thumb"
                  type="url"
                  value={thumb}
                  onChange={(e) => setThumb(e.target.value)}
                  placeholder="https://example.com/thumb.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cutout">全身照URL / Cutout Image URL</Label>
                <Input
                  id="cutout"
                  type="url"
                  value={cutout}
                  onChange={(e) => setCutout(e.target.value)}
                  placeholder="https://example.com/cutout.png"
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                創建中... / Creating...
              </>
            ) : (
              "創建選手 / Create Fighter"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


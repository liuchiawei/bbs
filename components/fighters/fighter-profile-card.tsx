"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Ruler,
  Weight,
  Globe,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { FighterAvatar } from "@/components/fighters/fighter-avatar";
import type { FighterPublic } from "@/lib/types";

interface FighterProfileCardProps {
  fighter: FighterPublic;
}

/**
 * Fighter Profile Card Component
 * 選手資料卡片組件
 * Displays fighter basic information and profile
 */
export function FighterProfileCard({ fighter }: FighterProfileCardProps) {
  const externalData = fighter.external_data as Record<string, unknown> | null;

  // Extract social media links from external_data
  // 從 external_data 提取社交媒體連結
  const strFacebook = externalData?.strFacebook as string | undefined;
  const strTwitter = externalData?.strTwitter as string | undefined;
  const strInstagram = externalData?.strInstagram as string | undefined;
  const strYoutube = externalData?.strYoutube as string | undefined;
  const strWebsite = externalData?.strWebsite as string | undefined;
  const strBirthLocation = externalData?.strBirthLocation as string | undefined;

  const dateBorn = fighter.date_born ? new Date(fighter.date_born) : null;
  const formattedBirthDate = dateBorn
    ? dateBorn.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const sportTypeColors: Record<string, string> = {
    boxing: "bg-red-500/20 text-red-500 border-red-500/50",
    ufc: "bg-purple-500/20 text-purple-500 border-purple-500/50",
    mma: "bg-orange-500/20 text-orange-500 border-orange-500/50",
    other: "bg-gray-500/20 text-gray-500 border-gray-500/50",
  };

  return (
    <Card className="overflow-hidden">
      {/* Fighter Image */}
      {(fighter.cutout || fighter.thumb) && (
        <div
          className="relative w-full h-64 md:h-80 bg-muted flex items-center justify-center bg-cover bg-top"
          style={{ backgroundImage: `url(${fighter.thumb})` }}
        />
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Fighter Avatar */}
            <FighterAvatar
              thumb={
                (typeof fighter.cutout === "string" ? fighter.cutout : null) ||
                (typeof fighter.thumb === "string" ? fighter.thumb : null) ||
                undefined
              }
              name={fighter.name}
              size="lg"
              className="shrink-0 bg-primary"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {fighter.sport_type && (
                  <Badge
                    variant="outline"
                    className={`${
                      sportTypeColors[
                        typeof fighter.sport_type === "string"
                          ? fighter.sport_type
                          : String(fighter.sport_type)
                      ] || sportTypeColors.other
                    } border capitalize`}
                  >
                    {typeof fighter.sport_type === "string"
                      ? fighter.sport_type
                      : String(fighter.sport_type)}
                  </Badge>
                )}
                {fighter.position && (
                  <Badge variant="outline" className="text-xs">
                    {typeof fighter.position === "string"
                      ? fighter.position
                      : fighter.position
                      ? String(fighter.position)
                      : "Unknown"}
                  </Badge>
                )}
              </div>

              <CardTitle className="text-2xl md:text-3xl mb-4">
                {fighter.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {typeof fighter.weight === "number"
                  ? fighter.weight
                  : typeof fighter.weight === "string"
                  ? fighter.weight
                  : fighter.weight
                  ? String(fighter.weight)
                  : "Unknown"}
              </CardDescription>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>
              {typeof fighter.nationality === "string"
                ? fighter.nationality
                : fighter.nationality
                ? String(fighter.nationality)
                : "Unknown"}
            </span>
          </div>
          {formattedBirthDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formattedBirthDate}</span>
            </div>
          )}
          {strBirthLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{strBirthLocation}</span>
            </div>
          )}
        </div>

        {/* Physical Stats */}
        {(fighter.height || fighter.weight) && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              <span>
                {typeof fighter.height === "number"
                  ? fighter.height
                  : typeof fighter.height === "string"
                  ? fighter.height
                  : fighter.height
                  ? String(fighter.height)
                  : "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Weight className="w-4 h-4" />
              <span>
                {typeof fighter.weight === "number"
                  ? fighter.weight
                  : typeof fighter.weight === "string"
                  ? fighter.weight
                  : fighter.weight
                  ? String(fighter.weight)
                  : "Unknown"}
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {fighter.description && (
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {typeof fighter.description === "string"
                ? fighter.description
                : fighter.description
                ? String(fighter.description)
                : "No description available"}
            </p>
          </div>
        )}

        {/* Social Media Links */}
        {(strFacebook ||
          strTwitter ||
          strInstagram ||
          strYoutube ||
          strWebsite) && (
          <div>
            <h3 className="font-semibold mb-2">Links</h3>
            <div className="flex flex-wrap items-center gap-3">
              {strWebsite && (
                <Link
                  href={strWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Website
                </Link>
              )}
              {strFacebook && (
                <Link
                  href={strFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Link>
              )}
              {strTwitter && (
                <Link
                  href={strTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Link>
              )}
              {strInstagram && (
                <Link
                  href={strInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Link>
              )}
              {strYoutube && (
                <Link
                  href={strYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Youtube className="w-4 h-4" />
                  YouTube
                </Link>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

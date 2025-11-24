"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Building2, Globe } from "lucide-react";
import type { Event } from "@/lib/types";

interface EventDetailCardProps {
  event: Event & {
    external_data?: Record<string, unknown> | null;
  };
}

/**
 * Event Detail Card Component
 * 賽事詳細資訊卡片組件
 * Displays rich event information from TheSportsDB API
 */
export function EventDetailCard({ event }: EventDetailCardProps) {
  const externalData = event.external_data as Record<string, unknown> | null;

  // Extract data from external_data
  // 從 external_data 提取數據
  const strDescriptionEN = externalData?.strDescriptionEN as string | undefined;
  const strVenue = externalData?.strVenue as string | undefined;
  const strCountry = externalData?.strCountry as string | undefined;
  const strCity = externalData?.strCity as string | undefined;
  const strPoster = externalData?.strPoster as string | undefined;
  const strThumb = externalData?.strThumb as string | undefined;
  const strLeagueBadge = externalData?.strLeagueBadge as string | undefined;
  const strResult = externalData?.strResult as string | undefined;
  const strStatus = externalData?.strStatus as string | undefined;

  const fightDate = new Date(event.fight_date);
  const formattedDate = fightDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = fightDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="py-0 overflow-hidden">
      {/* Event Poster/Thumbnail */}
      {(strPoster || strThumb) && (
        <div className="relative w-full h-64 md:h-80 bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image
            src={strPoster || strThumb || ""}
            alt={event.name}
            className="w-full h-full object-cover object-top select-none pointer-events-none"
            width={1000}
            height={1000}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* League Badge */}
            {strLeagueBadge && (
              <div className="mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={strLeagueBadge}
                  alt={
                    typeof event.sport_type === "string"
                      ? event.sport_type
                      : event.sport_type
                      ? String(event.sport_type)
                      : "League"
                  }
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-2">
              {event.sport_type && (
                <Badge variant="outline" className="capitalize">
                  {typeof event.sport_type === "string"
                    ? event.sport_type
                    : String(event.sport_type)}
                </Badge>
              )}
              {strStatus && (
                <Badge
                  variant={
                    strStatus === "Not Started"
                      ? "default"
                      : strStatus === "Live"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {strStatus}
                </Badge>
              )}
            </div>

            <CardTitle className="text-2xl md:text-3xl mb-4">
              {event.name}
            </CardTitle>
          </div>
        </div>

        {/* Date and Time */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Venue Information */}
        {(strVenue || strCity || strCountry) && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
            {strVenue && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{strVenue}</span>
              </div>
            )}
            {(strCity || strCountry) && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{[strCity, strCountry].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pb-6">
        {/* Description */}
        {strDescriptionEN && (
          <div>
            <h3 className="font-semibold">About This Event</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {strDescriptionEN}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

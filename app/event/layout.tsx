import type { Metadata } from "next";

/**
 * Events Layout
 * イベントレイアウト
 * Provides shared layout and SEO metadata for all event pages
 */
export const metadata: Metadata = {
  title: {
    default: "Combat Sports Events",
    template: "%s | Combat Sports Events",
  },
  description:
    "Discover and follow upcoming boxing, UFC, and MMA events. Place bets, join discussions, and stay updated with the latest combat sports news.",
  keywords: ["boxing", "UFC", "MMA", "combat sports", "events", "betting"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BBS Combat Sports",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


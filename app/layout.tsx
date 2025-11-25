import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Roboto, Roboto_Mono, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { NavbarLoading } from "@/components/ui/navbar-loading";
import { ThemeProvider } from "next-themes";
import { ThemeToggleButton } from "@/components/common/theme-toggle-button";

const robotoSans = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BBS | Boxing Buddies Society",
  description:
    "A boxing community for boxing buddies to share their thoughts and experiences.",
  // TODO: add open graph metadata
  // openGraph: {
  //   title: "BBS | Boxing Buddies Society",
  //   description: "A boxing community for boxing buddies to share their thoughts and experiences.",
  //   url: "https://bbs.boxingbuddies.com",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${robotoSans.variable} ${robotoMono.variable} ${notoSansTC.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* SuspenseでNavbarをラップして、PPRが正しく動作するようにする */}
          {/* Wrap Navbar with Suspense to allow PPR to work correctly */}
          <Suspense fallback={<NavbarLoading />}>
            <Navbar />
          </Suspense>
          <main className="w-full max-w-3xl h-full min-h-screen mx-auto px-2 pt-12">
            {children}
          </main>
          <ThemeToggleButton className="fixed bottom-4 right-4 z-50" />
          <Footer />
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

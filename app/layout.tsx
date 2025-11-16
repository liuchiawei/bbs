import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BBS | Boxing Buddies Society",
  description: "A boxing community for boxing buddies to share their thoughts and experiences.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <main className="w-full max-w-3xl h-full min-h-screen mx-auto px-2 pt-12">
          {children}
        </main>
        <Footer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

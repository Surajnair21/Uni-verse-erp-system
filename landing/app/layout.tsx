import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NoiseOverlay from "@/components/NoiseOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniVerse — AI-Enabled University Academic Management Platform",
  description:
    "A lightweight academic operations platform with strict RBAC and an AI academic assistant for secure, natural-language insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NoiseOverlay />
        {children}
      </body>
    </html>
  );
}

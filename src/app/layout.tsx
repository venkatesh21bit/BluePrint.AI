import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StreamingProvider } from "@/contexts/StreamingContext";
import { SessionProvider } from "@/components/auth/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blueprint.AI — Turn vague ideas into structured execution plans",
  description:
    "Blueprint.AI maps opportunities with Opportunity Solution Trees, audits assumptions with The Mom Test, scores DVF-U risk, runs multi-agent user simulations, and sequences 30/60/90-day roadmaps.",
  keywords: [
    "product discovery",
    "opportunity solution tree",
    "the mom test",
    "DVF risk",
    "AI product strategy",
    "roadmap planning",
  ],
  openGraph: {
    title: "Blueprint.AI — Turn vague ideas into structured execution plans",
    description:
      "Map opportunities, audit assumptions, score risk, and simulate users before you write a line of code.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased bg-background`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SessionProvider>
          <StreamingProvider>
            {children}
          </StreamingProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

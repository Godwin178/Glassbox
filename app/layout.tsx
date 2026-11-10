import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const siteUrl = "https://glassbox-opensource.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Glassbox | Solana Transparency & Accountability",
    template: "%s | Glassbox",
  },
  description:
    "An open-source Solana toolkit for wallet inspection, transaction verification, public funding transparency, and auditable project records.",
  applicationName: "Glassbox",
  keywords: [
    "Solana",
    "blockchain transparency",
    "wallet inspection",
    "transaction verification",
    "open source",
    "public goods",
    "funding transparency",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Glassbox",
    title: "Glassbox | Solana Transparency & Accountability",
    description:
      "Inspect public Solana activity, verify transactions, and review transparent funding records with an open-source toolkit.",
  },
  twitter: {
    card: "summary",
    title: "Glassbox | Solana Transparency & Accountability",
    description:
      "An open-source toolkit for inspecting Solana wallets, verifying transactions, and reviewing public funding records.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}

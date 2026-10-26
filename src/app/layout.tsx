import type { Metadata, Viewport } from "next";
import "./globals.css";
import { company } from "@/config/company";

export const metadata: Metadata = {
  title: `${company.name} — ${company.serviceRegion} Roofing | Repairs, Replacements & Storm Response`,
  description: `${company.name}: flat, written prices for roof repair, replacement and 24/7 storm response in ${company.serviceRegion}. 25-year workmanship warranty, monthly financing, online booking.`,
};

export const viewport: Viewport = {
  themeColor: "#0e1826",
};

const fonts = (
  <link
    href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
    rel="stylesheet"
  />
);

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>{fonts}</head>
      <body className="noise-film min-h-screen">{children}</body>
    </html>
  );
}

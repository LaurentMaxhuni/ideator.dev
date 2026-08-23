import type { Metadata } from "next";
import { Outfit } from "next/font/google";

import "../index.css";

import Providers from "@/components/providers";

const outfit = Outfit({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ideator.dev",
  description: "Find, combine, and pressure-test product ideas before you build them.",
  metadataBase: new URL("https://ideator.dev"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

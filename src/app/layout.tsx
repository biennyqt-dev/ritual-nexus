import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ritual Nexus",
  description: "A focused map of Ritual resources.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

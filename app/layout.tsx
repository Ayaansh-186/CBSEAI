import type { Metadata, Viewport } from "next";
import { APP } from "@/lib/config";
import { AppShell } from "@/components/shell/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP.name} — ${APP.tagline}`,
  description: `A ${APP.board} Class ${APP.grade} tutor that writes answers the way the marking scheme reads them.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";
import { BottomPlayer } from "@/components/layout/BottomPlayer";

export const metadata: Metadata = {
  title: "EchoTale",
  description: "Audio storytelling platform",
  applicationName: "EchoTale",
  appleWebApp: {
    capable: true,
    title: "EchoTale",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/echotale-mark.svg", type: "image/svg+xml" }],
    apple: "/echotale-icon-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#100c25",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        {children}
        <BottomPlayer />
      </body>
    </html>
  );
}

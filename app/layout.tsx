import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const font = Mulish({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Календарь мероприятий ВТК-К",
  description: "Календарь мероприятий ВТК-К",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className}`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

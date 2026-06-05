import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { StandardsProvider } from "@/lib/standards-context";
import { HistoryProvider } from "@/lib/history-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PatternGuard — Architecture Standards Validator",
  description:
    "Upload diagrams or paste Swagger links to verify your architecture against established standards with AI-powered analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StandardsProvider>
          <HistoryProvider>
            <Header />
            <main className="flex-1">{children}</main>
          </HistoryProvider>
        </StandardsProvider>
      </body>
    </html>
  );
}

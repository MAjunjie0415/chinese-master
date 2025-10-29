import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "ChineseMaster - Business Chinese & HSK Learning Tool for Foreigners",
  description: "Master Business Chinese and HSK vocabulary with AI-powered spaced repetition. 8,000+ words, scenario-based learning, and smart review system. Free forever for foreign learners.",
  keywords: "business chinese learning, HSK vocabulary tool, chinese for foreigners, mandarin learning app, HSK exam preparation, business chinese vocabulary, learn chinese online, spaced repetition chinese",
  authors: [{ name: "ChineseMaster Team" }],
  creator: "ChineseMaster",
  publisher: "ChineseMaster",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chinesemaster.com/",
    title: "ChineseMaster - Business Chinese & HSK Learning Tool",
    description: "Master Business Chinese and HSK vocabulary with AI-powered spaced repetition. 8,000+ words waiting for you.",
    siteName: "ChineseMaster",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChineseMaster - Business Chinese & HSK Learning Tool",
    description: "Master Business Chinese and HSK vocabulary with AI-powered spaced repetition.",
  },
  alternates: {
    canonical: "https://chinesemaster.com/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#10B981" />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}

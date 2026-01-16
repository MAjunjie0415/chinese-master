export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

const lora = Lora({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-serif',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bizchinese.cc'),
  title: "BizChinese - Learn Business Chinese for Professionals",
  description: "Master Business Chinese for meetings, emails & negotiations. AI-powered learning from your own work materials. Upload documents, get personalized courses. Start free today.",
  keywords: "business chinese, learn chinese for work, mandarin for professionals, chinese for business meetings, business mandarin, corporate chinese training, chinese for executives",
  authors: [{ name: "BizChinese Team" }],
  creator: "BizChinese",
  publisher: "BizChinese",
  robots: "index, follow",
  verification: {
    google: "在这里填入你的Google验证码",
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bizchinese.cc/",
    title: "BizChinese - Business Chinese for Professionals",
    description: "Learn Chinese for the boardroom. AI extracts vocabulary from your real work documents. Courses for meetings, emails, and negotiations.",
    siteName: "BizChinese",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BizChinese - Business Chinese for Professionals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BizChinese - Business Chinese for Professionals",
    description: "Learn Chinese for the boardroom. AI-powered personalized learning from your work materials.",
    images: ["/twitter-image.png"],
  },
  alternates: {
    canonical: "https://bizchinese.cc/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#14B8A6" />
      </head>
      <body className={`${inter.variable} ${lora.variable} ${inter.className} min-h-screen antialiased text-main font-sans`}>
        <GoogleAnalytics GA_MEASUREMENT_ID="G-23KVM8MM06" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "BizChinese",
              "url": "https://bizchinese.cc",
              "description": "Business Chinese learning platform for professionals. Master Chinese for meetings, emails, and negotiations with AI-powered personalized courses.",
              "sameAs": [],
              "offers": {
                "@type": "Offer",
                "category": "Language Learning",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}

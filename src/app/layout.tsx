import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { generateMetadata as generateSEOMetadata, generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = generateSEOMetadata({
  title: "8rupiya.com - Find Nearby Shops & Businesses in India",
  description: "Discover local businesses, shops, and services near you. Browse by category, location, and ratings. Find the best shops in your city with 8rupiya.com - India's leading local business directory.",
  keywords: ['shops near me', 'local businesses', 'find shops', 'business directory', 'India shops'],
  url: 'https://8rupiya.com',
  type: 'website',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en-IN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=yes" />
        <link rel="canonical" href="https://8rupiya.com" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon_192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/favicon_512.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
        {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

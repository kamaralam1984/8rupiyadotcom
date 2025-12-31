import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AdStatusProvider } from "@/contexts/AdStatusContext";


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

export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: "8rupiya.com - Find Nearby Shops & Businesses in India",
    description: "Discover local businesses, shops, and services near you. Browse by category, location, and ratings. Find the best shops in your city with 8rupiya.com - India's leading local business directory.",
    keywords: ['shops near me', 'local businesses', 'find shops', 'business directory', 'India shops'],
    url: 'https://8rupiya.com',
    type: 'website',
  }),
  // Google Site Verification (Step 1 - Screenshot ke hisaab se)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'abc123xyz', // Google ne jo code diya hai wahi paste karo
  },
  // Google Official Logo Configuration (Most Important)
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon_32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon_512.png', sizes: '512x512', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon_512.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=yes" />
        <link rel="canonical" href="https://8rupiya.com" />
        
        {/* Google Official Logo - Force recognition */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon_192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/favicon_512.png" />
        <link rel="mask-icon" href="/favicon_512.png" color="#2563eb" />
        
        {/* Structured Data for Google - Organization Logo */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: '8rupiya.com',
              url: 'https://8rupiya.com',
              logo: 'https://8rupiya.com/favicon_512.png',
              description: 'Find Nearby Shops & Businesses in India',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+91-1234567890',
                contactType: 'Customer Service',
              },
              sameAs: [
                'https://facebook.com/8rupiya',
                'https://twitter.com/8rupiya',
                'https://instagram.com/8rupiya',
              ],
            }),
          }}
        />
        
        {/* Website Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: '8rupiya.com',
              url: 'https://8rupiya.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://8rupiya.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        
        {/* Preload Razorpay for faster payment gateway loading */}
        <link rel="preload" href="https://checkout.razorpay.com/v1/checkout.js" as="script" />
        
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4472734290958984"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: 'var(--bg)', color: 'var(--text)' }}
      >
        <ThemeProvider>
        <AdStatusProvider>
        <LanguageProvider>
        {children}
        </LanguageProvider>
        </AdStatusProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

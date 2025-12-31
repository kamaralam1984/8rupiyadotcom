import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  // Step 1: Google Site Verification (Screenshot ke hisaab se)
  // ⚠️ meta tag manually mat likho - Next.js automatically generate karega
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'K8rF07hqdaG9aERL', // Google ne jo code diya hai wahi paste karo
  },
  // Viewport and other meta tags (Next.js automatically head me add karega)
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#2563eb',
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
  // Additional meta tags
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      {/* Step 2: Head section delete kiya (Screenshot ke hisaab se) */}
      {/* Next.js automatically head section generate karega from metadata */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: 'var(--bg)', color: 'var(--text)' }}
      >
        {/* Structured Data for Google - Organization Logo */}
        <Script
          id="organization-schema"
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
        <Script
          id="website-schema"
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
        
        {/* Google AdSense */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4472734290958984"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        
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

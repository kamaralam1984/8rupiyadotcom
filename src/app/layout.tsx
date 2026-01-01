import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AdStatusProvider } from "@/contexts/AdStatusContext";
import AnalyticsProvider from "@/components/AnalyticsProvider";


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

// ✅ FINAL SAFE FIX (Production Grade)
// Isko hard-code kar do (bilkul allowed hai, Google token secret nahi hota)
export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: "8rupiya.com - Find Nearby Shops & Businesses in India",
    description: "Discover local businesses, shops, and services near you.",
    keywords: ['shops near me', 'local businesses', 'find shops'],
    url: 'https://8rupiya.com',
    type: 'website',
  }),
  // ❌ process.env... hata do yahan se - Hard-code karo (Production Grade)
  verification: {
    google: 'K8rF07hqdaG9aERLCYdlNrPQrL91W5sYmKzdiur3_Ao',
  },
  themeColor: '#2563eb',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon_512.png',
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
        
        {/* Google Analytics (Tag Manager) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AM-1765454983"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AM-1765454983');
            `,
          }}
        />
        
        <ThemeProvider>
        <AdStatusProvider>
        <LanguageProvider>
        <AnalyticsProvider>
        {children}
        </AnalyticsProvider>
        </LanguageProvider>
        </AdStatusProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

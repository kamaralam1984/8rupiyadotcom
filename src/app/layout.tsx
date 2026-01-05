import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { LanguageProvider } from "@/contexts/LanguageContext";
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

// Hindi/Devanagari font support
const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari", "latin"],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
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
    <html lang="en-IN" suppressHydrationWarning className="light">
      {/* ⚡ MOBILE PERFORMANCE: Resource hints for faster loading */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansDevanagari.variable} antialiased`}
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
        
        {/* ⚡ Google AdSense - Load after page is interactive */}
        <Script
          id="google-adsense"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var script = document.createElement('script');
                script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4472734290958984';
                script.async = true;
                script.crossOrigin = 'anonymous';
                document.head.appendChild(script);
              })();
            `,
          }}
        />
        
        {/* ⚡ Google Analytics - Load lazily to not block page load */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AM-1765454983"
          strategy="lazyOnload"
        />
        <Script
          id="google-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AM-1765454983');
            `,
          }}
        />
        
        {/* Force light mode - prevent dark mode */}
        <Script
          id="force-light-mode"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  root.classList.remove('dark');
                  root.classList.add('light');
                  root.setAttribute('data-theme', 'light');
                  root.style.colorScheme = 'light';
                  localStorage.setItem('theme', 'light');
                  
                  // Prevent dark mode from being applied
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (root.classList.contains('dark')) {
                          root.classList.remove('dark');
                          root.classList.add('light');
                        }
                      }
                    });
                  });
                  observer.observe(root, { attributes: true, attributeFilter: ['class'] });
                } catch(e) {
                  console.error('Error forcing light mode:', e);
                }
              })();
            `,
          }}
        />
        <AdStatusProvider>
        <LanguageProvider>
        <AnalyticsProvider>
        {children}
        </AnalyticsProvider>
        </LanguageProvider>
        </AdStatusProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
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
  display: 'swap', // Prevent FOIT - show fallback immediately
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false, // Not critical for initial load
  fallback: ['monospace'],
});

// Hindi/Devanagari font support
const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari", "latin"],
  display: 'swap', // Prevent FOIT - show fallback immediately
  preload: true,
  weight: ['400', '500', '600', '700'],
  fallback: ['Arial Unicode MS', 'Mangal', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
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
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon_512.png',
  },
};

// Move themeColor to viewport export (Next.js requirement)
export const viewport: Viewport = {
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning className="light">
      {/* ⚡ ULTRA-FAST LOADING: Critical resource hints and preloads */}
      <head>
        {/* Critical font preloads */}
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" as="style" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" as="style" />
        
        {/* DNS prefetch for faster connections */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Preconnect for critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Critical CSS inline to prevent FOUC */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for instant render */
            html{font-family:system-ui,-apple-system,sans-serif;color-scheme:light}
            body{margin:0;background:#fafafe;color:#0f0f0f;font-family:var(--font-geist-sans),system-ui,sans-serif}
            *{box-sizing:border-box}
            /* Prevent layout shifts */
            img{max-width:100%;height:auto;display:block}
            /* Skeleton loader styles */
            .skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
            @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
            /* Prevent jitter */
            [data-skeleton]{min-height:200px;background:#f0f0f0}
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansDevanagari.variable} antialiased`}
        style={{ 
          background: 'var(--bg)', 
          color: 'var(--text)',
          // Prevent layout shifts
          minHeight: '100vh',
          // Smooth scrolling
          scrollBehavior: 'smooth',
          // GPU acceleration for smooth animations
          willChange: 'scroll-position',
        }}
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

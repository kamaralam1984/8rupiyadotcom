'use client';

import Script from 'next/script';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';

export default function ClientOnlyScripts() {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <>
      {/* Google AdSense */}
      {adsenseId && (
        <Script
          id="adsense-loader"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      )}

      {/* Organization Schema */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      {/* Website Schema */}
      <Script
        id="website-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />

      {/* Microsoft Clarity Analytics */}
      {clarityId && (
        <Script
          id="clarity-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `,
          }}
        />
      )}

      {/* Theme Initialization Script */}
      <Script
        id="theme-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const theme = localStorage.getItem('theme') || 'light';
                const root = document.documentElement;
                
                // Ensure theme is either light or dark
                const validTheme = (theme === 'light' || theme === 'dark') ? theme : 'light';
                
                // Remove all theme classes first
                root.classList.remove('light', 'dark');
                // Add the theme class immediately
                root.classList.add(validTheme);
                
                // Set data attribute for additional styling
                root.setAttribute('data-theme', validTheme);
                
                // Force color-scheme property
                root.style.colorScheme = validTheme;
              } catch (e) {
                // If anything fails, default to light mode
                const root = document.documentElement;
                root.classList.remove('light', 'dark');
                root.classList.add('light');
                root.setAttribute('data-theme', 'light');
                root.style.colorScheme = 'light';
              }
            })();
          `,
        }}
      />
    </>
  );
}


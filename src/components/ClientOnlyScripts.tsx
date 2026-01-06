'use client';

import Script from 'next/script';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';

export default function ClientOnlyScripts() {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
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

      {/* Force Light Mode Script */}
      <Script
        id="force-light-mode"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const root = document.documentElement;
                
                // Always force light mode
                root.classList.remove('light', 'dark');
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
              } catch (e) {
                console.error('Error forcing light mode:', e);
              }
            })();
          `,
        }}
      />
    </>
  );
}


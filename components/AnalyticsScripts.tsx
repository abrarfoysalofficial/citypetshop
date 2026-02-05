"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim();
const GTM_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GTM === "true" && !!GTM_ID;

const CF_TOKEN = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN?.trim();
const CF_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CF_ANALYTICS === "true" && !!CF_TOKEN;

/** Inject GTM and Cloudflare Analytics only on storefront (exclude /admin, /studio). */
export default function AnalyticsScripts() {
  const pathname = usePathname();
  const isStorefront = !pathname?.startsWith("/admin") && !pathname?.startsWith("/studio");

  useEffect(() => {
    if (!isStorefront || !CF_ENABLED || !CF_TOKEN) return;
    const s = document.createElement("script");
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token: CF_TOKEN }));
    document.head.appendChild(s);
    return () => {
      s.remove();
    };
  }, [isStorefront, CF_TOKEN]);

  if (!isStorefront) return null;

  return (
    <>
      {GTM_ENABLED && GTM_ID && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height={0}
              width={0}
              style={{ display: "none", visibility: "hidden" }}
              title="GTM"
            />
          </noscript>
        </>
      )}
    </>
  );
}

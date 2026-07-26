"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { FB_PIXEL_ID, pageview } from "@/lib/fpixel";

/**
 * Meta (Facebook) Pixel. Kök layout'a bir kez eklenir.
 * - fbevents.js'i yükler ve ilk PageView'ı gönderir.
 * - App Router'da gezinme (rota değişimi) tam sayfa yenileme yapmadığı için
 *   pathname değişince PageView'ı tekrar tetikler.
 * Kayıt/dönüşüm gibi özel olaylar için `track()` (src/lib/fpixel.ts) kullanılır.
 */
export function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    pageview();
  }, [pathname]);

  if (!FB_PIXEL_ID) return null;

  return (
    <Script id="fb-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${FB_PIXEL_ID}');
        fbq('track', 'PageView');
      `}
    </Script>
  );
}

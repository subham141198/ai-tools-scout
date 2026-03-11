
'use client';

import Script from 'next/script';

/**
 * Loads the Google AdSense script globally.
 * Replace 'ca-pub-XXXXXXXXXXXXXXXX' with your actual Publisher ID in .env
 */
export function AdSense() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  if (!publisherId) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

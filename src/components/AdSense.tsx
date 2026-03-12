'use client';

import Script from 'next/script';

/**
 * Loads the Google AdSense script globally.
 * strategy="lazyOnload" helps ensure the page content is ready before the ad engine starts.
 */
export function AdSense() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  if (!publisherId) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}

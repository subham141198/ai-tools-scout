import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { CompareBar } from '@/components/CompareBar';
import { AdSense } from '@/components/AdSense';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import { GlobalLoader } from '@/components/GlobalLoader';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://aitoolscompus.vercel.app'),
  title: {
    default: 'Ainexa - Discover the Best AI Tools for Your Profession',
    template: '%s | Ainexa'
  },
  description: 'Explore the global AI ecosystem with Ainexa. Discover thousands of curated AI tools categorized by profession and work type.',
  keywords: ['Ainexa', 'AI tools', 'artificial intelligence', 'directory', 'comparison', 'productivity', 'software'],
  authors: [{ name: 'Ainexa Team' }],
  creator: 'Ainexa',
  publisher: 'Ainexa',
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "skXpIhB8h7Ug4JDTUKy6K7ql7eKfKGqIJYiihtjG_co",
  },
  other: {
    "google-adsense-account": "ca-pub-1827849890156562",
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aitoolscompus.vercel.app',
    siteName: 'Ainexa',
    title: 'Ainexa - Global Intelligence for Professional Discovery',
    description: 'The world\'s most comprehensive directory of AI tools researched by Ainexa AI.',
    images: [
      {
        url: 'https://picsum.photos/seed/ainexa-og/1200/630',
        width: 1200,
        height: 630,
        alt: 'Ainexa - Professional AI Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ainexa - Find Your Next AI Tool',
    description: 'Expert-curated AI directory with side-by-side comparison engine.',
    images: ['https://picsum.photos/seed/ainexa-twitter/1200/630'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <body className="font-body antialiased selection:bg-primary/20 selection:text-primary">
        <AdSense />
        <FirebaseClientProvider>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <GlobalLoader />
            </div>
          }>
            {children}
          </Suspense>
          <Suspense>
            <CompareBar />
          </Suspense>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

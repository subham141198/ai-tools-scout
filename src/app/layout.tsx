
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
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://aitoolscompus.vercel.app'),
  title: {
    default: 'AI Tool Scout - Discover the Best AI Tools by Profession',
    template: '%s | AI Tool Scout'
  },
  description: 'Explore thousands of AI tools categorized by profession and work type. Compare features, pricing, and performance in one place.',
  keywords: ['AI tools', 'artificial intelligence', 'directory', 'comparison', 'productivity', 'software', 'machine learning'],
  authors: [{ name: 'AI Tool Scout Team' }],
  creator: 'AI Tool Scout',
  publisher: 'AI Tool Scout',
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "REPLACE_WITH_YOUR_VERIFICATION_TOKEN", // Get this from Search Console HTML Tag method
  },
  other: {
    "google-adsense-account": "ca-pub-1827849890156562",
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aitoolscompus.vercel.app',
    siteName: 'AI Tool Scout',
    title: 'AI Tool Scout - Global Intelligence for Professional Discovery',
    description: 'The world\'s most comprehensive directory of AI tools researched by Gemini AI.',
    images: [
      {
        url: 'https://picsum.photos/seed/ai-scout-og/1200/630',
        width: 1200,
        height: 630,
        alt: 'AI Tool Scout - Professional AI Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Tool Scout - Find Your Next AI Tool',
    description: 'Expert-curated AI directory with side-by-side comparison engine.',
    images: ['https://picsum.photos/seed/ai-scout-twitter/1200/630'],
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

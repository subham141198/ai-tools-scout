import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { CompareBar } from '@/components/CompareBar';
import { Suspense } from 'react';

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://aitoolscout.com'),
  title: {
    default: 'AI Tool Scout - Discover the Best AI Tools by Profession',
    template: '%s | AI Tool Scout'
  },
  description: 'Explore 10,000+ AI tools categorized by profession and work type. Compare features, pricing, and performance in one place.',
  keywords: ['AI tools', 'artificial intelligence', 'directory', 'comparison', 'productivity', 'software', 'machine learning'],
  authors: [{ name: 'AI Tool Scout Team' }],
  creator: 'AI Tool Scout',
  publisher: 'AI Tool Scout',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aitoolscout.com',
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
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/20 selection:text-primary">
        <FirebaseClientProvider>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground animate-pulse font-bold">Scouting Intelligence...</div>}>
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

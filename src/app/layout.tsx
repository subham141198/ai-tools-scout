
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { CompareBar } from '@/components/CompareBar';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'AI Tool Scout - Discover the Best AI Tools by Profession',
  description: 'Explore 10,000+ AI tools categorized by profession and work type. Compare features, pricing, and performance in one place.',
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

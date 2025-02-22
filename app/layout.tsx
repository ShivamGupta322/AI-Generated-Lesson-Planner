'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false, // Disable preloading to prevent abort errors
  adjustFontFallback: false, // Disable adjustment to prevent timing issues
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import HydrationSuppressor from '@/components/HydrationSuppressor';
import MobileOptimizedInterface from '@/components/MobileOptimizedInterface';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'الغلة - سوق المزارعين الإلكتروني',
  description: 'منصة متكاملة للمزارعين لبيع وشراء المنتجات الزراعية، المعدات، الأراضي، والخدمات الاستشارية',
  keywords: 'زراعة، مزارعين، سوق إلكتروني، منتجات زراعية، معدات زراعية، أراضي زراعية',
  authors: [{ name: 'Elghella Team' }],
  creator: 'Elghella',
  publisher: 'Elghella',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://elghella-v3-omega.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'الغلة - سوق المزارعين الإلكتروني',
    description: 'منصة متكاملة للمزارعين لبيع وشراء المنتجات الزراعية، المعدات، الأراضي، والخدمات الاستشارية',
    url: 'https://elghella-v3-omega.vercel.app',
    siteName: 'الغلة',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'الغلة - سوق المزارعين الإلكتروني',
      },
    ],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'الغلة - سوق المزارعين الإلكتروني',
    description: 'منصة متكاملة للمزارعين لبيع وشراء المنتجات الزراعية، المعدات، الأراضي، والخدمات الاستشارية',
    images: ['/assets/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#2d5016" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="الغلة" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2d5016" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Critical preconnect only */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://rcckdqrnzcdzbofiguxx.supabase.co" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileImage" content="/favicon-32x32.png" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "الغلة",
              "alternateName": "Elghella",
              "url": "https://elghella-v3-omega.vercel.app",
              "description": "منصة متكاملة للمزارعين لبيع وشراء المنتجات الزراعية، المعدات، الأراضي، والخدمات الاستشارية",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://elghella-v3-omega.vercel.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <HydrationSuppressor>
          <MobileOptimizedInterface>
            <ClientLayout>
              {children}
            </ClientLayout>
          </MobileOptimizedInterface>
        </HydrationSuppressor>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata: Metadata = {
  title: {
    default: 'Portfolio | Crennect',
    template: '%s | Crennect Portfolio',
  },
  description: 'Explore our portfolio of brand strategy, creative marketing, and AI-powered solutions. See how we help new-age brands become market leaders.',
  keywords: ['portfolio', 'brand strategy', 'creative agency', 'case studies', 'Crennect'],
  authors: [{ name: 'Crennect' }],
  openGraph: {
    title: 'Portfolio | Crennect',
    description: 'Explore our portfolio of brand strategy, creative marketing, and AI-powered solutions.',
    url: 'https://crennect.com/portfolio',
    siteName: 'Crennect',
    type: 'website',
    images: [
      {
        url: 'https://crennect.com/assets/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Crennect Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio | Crennect',
    description: 'Explore our portfolio of brand strategy, creative marketing, and AI-powered solutions.',
    images: ['https://crennect.com/assets/images/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;700;800;900&family=Playfair+Display:ital,wght@1,700&family=Jersey+20&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        {/* Parent site styles for header/footer - loaded first */}
        <link rel="stylesheet" href="/styles.css" />
        <link rel="icon" type="image/x-icon" href="/assets/favicon/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16x16.png" />
      </head>
      <body>
        <div className="page">
          <LayoutWrapper>
            <main id="main-content">{children}</main>
          </LayoutWrapper>
        </div>
      </body>
    </html>
  );
}

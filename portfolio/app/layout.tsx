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

        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QQNDVCPK3X"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QQNDVCPK3X');
            `,
          }}
        />

        {/* Organization schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Crennect',
              legalName: 'Crennect LLP',
              url: 'https://www.crennect.com',
              logo: 'https://www.crennect.com/assets/images/logo.svg',
              image: 'https://www.crennect.com/assets/images/og-image.jpg',
              description:
                'Crennect is a brand and creative agency helping new-age, high-aspiration brands become the obvious choice in their category through strategy, design, content, and AI capabilities.',
              email: 'reach@crennect.com',
              telephone: '+91-79774-93025',
              address: {
                '@type': 'PostalAddress',
                streetAddress:
                  '13, Embassy 247 Park, Tower B, Lal Bahadur Shastri Marg, Vikhroli West',
                addressLocality: 'Mumbai',
                addressRegion: 'Maharashtra',
                postalCode: '400083',
                addressCountry: 'IN',
              },
              sameAs: [
                'https://www.instagram.com/crennectmedia/',
                'https://www.linkedin.com/company/crennect/',
                'https://www.youtube.com/@prasaddanie',
              ],
            }),
          }}
        />
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

import { Suspense } from 'react';
import type { Metadata } from 'next';
import PortfolioCard from '@/components/PortfolioCard';
import SearchBar from '@/components/SearchBar';
import TagFilter from '@/components/TagFilter';
import { getPublishedPortfolios, getAllTags } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Browse our collection of brand strategy, creative marketing, and AI-powered solutions case studies.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: {
    search?: string;
    tags?: string;
    page?: string;
  };
}

async function getCachedPortfolios(search?: string, tags?: string[]) {
  try {
    const { unstable_cache } = await import('next/cache');
    const key = `portfolios:${search || ''}:${(tags || []).join(',')}`;
    return unstable_cache(
      () => getPublishedPortfolios({ search, tags, page: 1, limit: 1000 }),
      [key],
      { revalidate: 60, tags: ['portfolios'] }
    )();
  } catch {
    return getPublishedPortfolios({ search, tags, page: 1, limit: 1000 });
  }
}

async function PortfolioContent({ searchParams }: PageProps) {
  const search = searchParams.search;
  const tags = searchParams.tags?.split(',').filter(Boolean);

  const [{ portfolios: rawPortfolios }, allTags] = await Promise.all([
    getCachedPortfolios(search, tags),
    getAllTags(),
  ]);

  const portfolios = rawPortfolios;

  return (
    <>
      {/* Filters Section */}
      <section style={{ background: '#fff', paddingTop: '40px', paddingBottom: '20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
          <div className="portfolio-filters">
            <SearchBar />
            <TagFilter tags={allTags} />
          </div>
        </div>
      </section>

      {/* Portfolio Grid Section */}
      <section style={{ background: '#fff', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
          {portfolios.length > 0 ? (
            <>
              <div className="portfolio-grid">
                {portfolios.map((portfolio: any) => (
                  <PortfolioCard key={portfolio.id} portfolio={portfolio} />
                ))}
              </div>
            </>
          ) : (
            <div className="portfolio-empty">
              <div className="portfolio-empty-icon">📂</div>
              <h3 className="portfolio-empty-title">Try something else</h3>
              <p>
                {search || tags
                  ? "Try adjusting your search or filters."
                  : "Check back soon for new case studies."}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function PortfolioPage({ searchParams }: PageProps) {
  return (
    <>
      {/* Hero Section — place hero-reel.mp4 in /public/assets/videos/ */}
      <section className="portfolio-hero">
        <video
          className="portfolio-hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/images/hero-poster.webp"
        >
          <source src="/assets/video/hero-reel.mp4" type="video/mp4" />
        </video>
        <div className="portfolio-hero-overlay" />
        <div className="portfolio-hero-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
          <h1 className="portfolio-hero-title">
            <span className="font-primary">Our </span>
            <span className="font-curvy">Work</span>
          </h1>
          <p className="portfolio-hero-subtitle">
            Explore how we help brands define authority, break categories,
            and scale with intelligent systems.
          </p>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="portfolio-loading">
            <div className="portfolio-spinner"></div>
          </div>
        }
      >
        <PortfolioContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

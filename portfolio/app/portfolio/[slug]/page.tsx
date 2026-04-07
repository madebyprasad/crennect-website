import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { getPortfolioBySlug, getSuggestedPortfolios } from '@/lib/db';
import type { PortfolioMedia } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const portfolio = await getPortfolioBySlug(params.slug);

  if (!portfolio) {
    return {
      title: 'Portfolio Not Found',
    };
  }

  return {
    title: portfolio.title,
    description: portfolio.description || `Case study: ${portfolio.title}`,
    openGraph: {
      title: `${portfolio.title} | Crennect Portfolio`,
      description: portfolio.description || `Case study: ${portfolio.title}`,
      images: portfolio.featured_image_url
        ? [{ url: portfolio.featured_image_url }]
        : undefined,
    },
  };
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  const [portfolio, suggested] = await Promise.all([
    getPortfolioBySlug(params.slug),
    getSuggestedPortfolios(params.slug, 2),
  ]);

  if (!portfolio) {
    notFound();
  }

  const tags = portfolio.tags || [];
  const allMedia: PortfolioMedia[] = portfolio.media || (portfolio as any).portfolio_media || [];
  // Separate hero video (always full-width, before gallery) from gallery media
  const heroVideo = allMedia.find((m) => m.alt_text === 'hero-video') || null;
  const media: PortfolioMedia[] = allMedia.filter((m) => m.alt_text !== 'hero-video');

  const isYouTube = (url: string) => /youtube\.com|youtu\.be/.test(url);
  const getYouTubeId = (url: string) => {
    const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return m?.[1];
  };

  const layoutClass = `portfolio-media-grid portfolio-media-grid--${portfolio.gallery_layout || 'stack'}`;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <>
      <article className="portfolio-detail">
        <div className="container">
          {/* Back Link */}
          <Link
            href="/portfolio"
            className="portfolio-back-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-light)',
              marginBottom: '32px',
              fontSize: '14px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Portfolio
          </Link>

          {/* Header */}
          <header className="portfolio-detail-header">
            <h1 className="portfolio-detail-title">{portfolio.title}</h1>
            <div className="portfolio-detail-meta">
              {portfolio.client_name && (
                <span>
                  <strong>Client:</strong> {portfolio.client_name}
                </span>
              )}
              {portfolio.project_date && (
                <span>
                  <strong>Date:</strong> {formatDate(portfolio.project_date)}
                </span>
              )}
              {tags.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {tags.map((tagItem: any) => {
                    const tag = tagItem.tags || tagItem;
                    return (
                      <span key={tag.id || tag.slug} className="portfolio-card-tag">
                        {tag.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {portfolio.featured_image_url && (
            <div className="portfolio-featured-image">
              <img
                src={portfolio.featured_image_url}
                alt={portfolio.title}
              />
            </div>
          )}

          {/* Description */}
          {portfolio.description && (
            <section style={{ marginBottom: '48px' }}>
              <p style={{ fontSize: '16px', color: 'var(--text-light)', lineHeight: '1.8' }}>
                {portfolio.description}
              </p>
            </section>
          )}

          {/* Challenge & Strategy */}
          {(portfolio.challenge_content || portfolio.strategy_content) && (
            <div className="portfolio-two-column">
              {portfolio.challenge_content && (
                <section className="portfolio-challenge-section">
                  <h2 className="portfolio-section-title">The Challenge</h2>
                  <div
                    className="portfolio-section-content"
                    dangerouslySetInnerHTML={{ __html: formatContent(portfolio.challenge_content) }}
                  />
                </section>
              )}
              {portfolio.strategy_content && (
                <section className="portfolio-strategy-section">
                  <h2 className="portfolio-section-title">Our Strategy</h2>
                  <div
                    className="portfolio-section-content"
                    dangerouslySetInnerHTML={{ __html: formatContent(portfolio.strategy_content) }}
                  />
                </section>
              )}
            </div>
          )}

          {/* Hero Video — always full-width, no title */}
          {heroVideo && heroVideo.content_url && (
            <section className="portfolio-hero-video">
              {isYouTube(heroVideo.content_url) ? (
                <div style={{ aspectRatio: '16/9', position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                  <div
                    className="yt-facade"
                    data-ytid={getYouTubeId(heroVideo.content_url)}
                    style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeId(heroVideo.content_url)}/hqdefault.jpg`}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <span className="yt-play-btn">
                      <svg viewBox="0 0 68 48" width="68" height="48">
                        <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#ff0000"/>
                        <path d="M45 24 27 14v20" fill="#fff"/>
                      </svg>
                    </span>
                  </div>
                </div>
              ) : (
                <video
                  src={heroVideo.content_url}
                  controls
                  playsInline
                  style={{ width: '100%', aspectRatio: '16/9', display: 'block', borderRadius: '8px', background: '#000' }}
                />
              )}
            </section>
          )}

          {/* Media Gallery */}
          {media.length > 0 && (
            <section className="portfolio-media-gallery">
              <h2 className="portfolio-section-title" style={{ marginBottom: '24px' }}>
                Project Gallery
              </h2>
              <div className={layoutClass}>
                {media.filter(m => m.media_type !== 'text').map((item) => {
                  const modalId = `media-${item.id}`;
                  const isClickable = (item.media_type === 'image' || item.media_type === 'video') && item.content_url;

                  if (item.media_type === 'link' && item.content_url) {
                    const ytId = isYouTube(item.content_url) ? getYouTubeId(item.content_url) : null;
                    if (ytId) {
                      return (
                        <div key={item.id} style={{ aspectRatio: '16/9', position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                          <div
                            className="yt-facade"
                            data-ytid={ytId}
                            style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}
                          >
                            <img
                              src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                            <span className="yt-play-btn">
                              <svg viewBox="0 0 68 48" width="68" height="48">
                                <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#ff0000"/>
                                <path d="M45 24 27 14v20" fill="#fff"/>
                              </svg>
                            </span>
                          </div>
                        </div>
                      );
                    }
                    let domain = '';
                    try { domain = new URL(item.content_url).hostname.replace('www.', ''); } catch {}
                    return (
                      <div key={item.id}>
                        <a
                          href={item.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="portfolio-media-link-card"
                        >
                          <span className="portfolio-media-link-card-icon">🔗</span>
                          <div>
                            {item.title && <div className="portfolio-media-link-card-title">{item.title}</div>}
                            <div className="portfolio-media-link-card-domain">{domain}</div>
                          </div>
                        </a>
                      </div>
                    );
                  }

                  return (
                    <div key={item.id}>
                      {isClickable ? (
                        <a href={`#${modalId}`} className="portfolio-media-item portfolio-media-item--clickable">
                          {item.media_type === 'image' && (
                            <img src={item.content_url!} alt={item.alt_text || item.title || 'Portfolio media'} />
                          )}
                          {item.media_type === 'video' && (
                            <video src={item.content_url!} muted playsInline preload="metadata" />
                          )}
                          <span className="media-item-zoom-hint">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                            </svg>
                          </span>
                        </a>
                      ) : (
                        <div className="portfolio-media-item">
                          {item.media_type === 'embed' && item.embed_code && (
                            <div className="portfolio-media-embed" dangerouslySetInnerHTML={{ __html: item.embed_code }} />
                          )}
                        </div>
                      )}

                      {/* CSS :target modal — closes on overlay click via href="#" */}
                      {isClickable && (
                        <div id={modalId} className="media-modal-target">
                          <a href="#" className="media-modal-backdrop" aria-label="Close" />
                          <div className="media-modal-box">
                            <a href="#" className="media-modal-close" aria-label="Close">✕</a>
                            {item.media_type === 'image' && (
                              <img src={item.content_url!} alt={item.alt_text || item.title || ''} />
                            )}
                            {item.media_type === 'video' && (
                              <video src={item.content_url!} controls />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Closing Content */}
          {portfolio.closing_content && (
            <section style={{ marginBottom: '64px' }}>
              <h2 className="portfolio-section-title">Results & Impact</h2>
              <div
                className="portfolio-section-content"
                dangerouslySetInnerHTML={{ __html: formatContent(portfolio.closing_content) }}
              />
            </section>
          )}

          {/* Custom Text Sections */}
          {media.filter((m: any) => m.media_type === 'text').map((item: any) =>
            item.content_text ? (
              <section key={item.id} style={{ marginBottom: '48px' }}>
                {item.title && <h2 className="portfolio-section-title">{item.title}</h2>}
                <div
                  className="portfolio-section-content"
                  dangerouslySetInnerHTML={{ __html: formatContent(item.content_text) }}
                />
              </section>
            ) : null
          )}

          {/* Suggested Portfolios */}
          {suggested.length > 0 && (
            <section style={{ marginBottom: '64px' }}>
              <h2 className="portfolio-section-title" style={{ marginBottom: '24px' }}>
                More Work
              </h2>
              <div className="portfolio-suggested-grid">
                {suggested.map((p) => (
                  <Link
                    key={p.id}
                    href={`/portfolio/${p.slug}`}
                    style={{
                      display: 'block',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--border)',
                      transition: 'box-shadow 0.2s',
                    }}
                    className="portfolio-suggested-card"
                  >
                    {p.featured_image_url ? (
                      <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                        <img
                          src={p.featured_image_url}
                          alt={p.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div style={{ aspectRatio: '16/10', background: 'var(--bg-off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                    )}
                    <div style={{ padding: '16px' }}>
                    <div className="portfolio-suggested-title" style={{ fontWeight: '600', fontSize: '16px' }}>  {p.title}</div>
                      {p.description && (
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }} className="portfolio-suggested-desc">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section
            style={{
              textAlign: 'center',
              padding: '48px',
              background: 'var(--bg-off-white)',
              borderRadius: 'var(--radius-lg)',
              marginTop: '64px',
            }}
          >
            <h3 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '10px', lineHeight: '1' }}>
              Ready to create something amazing?
            </h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
              Let&apos;s discuss how we can help your brand stand out.
            </p>
            <Link href="/contact" className="portfolio-button portfolio-button-primary">
              Get in Touch
            </Link>
          </section>
        </div>
      </article>

      {/* View tracking (unique per browser) + YouTube facade init */}
      <Script
        id="page-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: [
            '(function(){',
            '  try{',
            '    var k="vp_' + portfolio.id + '";',
            '    if(!localStorage.getItem(k)){localStorage.setItem(k,"1");fetch("/api/portfolios/' + portfolio.id + '",{method:"PATCH"});}',
            '  }catch(e){}',
            '  document.querySelectorAll(".yt-facade").forEach(function(el){',
            '    el.addEventListener("click",function(){',
            '      var id=this.getAttribute("data-ytid");',
            '      var f=document.createElement("iframe");',
            '      f.src="https://www.youtube.com/embed/"+id+"?rel=0&modestbranding=1&autoplay=1";',
            '      f.setAttribute("allow","autoplay;encrypted-media;fullscreen");',
            '      f.setAttribute("allowfullscreen","");',
            '      f.style.cssText="position:absolute;inset:0;width:100%;height:100%;border:none;display:block;";',
            '      this.parentNode.replaceChild(f,this);',
            '    });',
            '  });',
            '})();',
          ].join('\n'),
        }}
      />
    </>
  );
}

function formatContent(content: string): string {
  if (!content) return '';
  return content
    .split('\n\n')
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join('');
}

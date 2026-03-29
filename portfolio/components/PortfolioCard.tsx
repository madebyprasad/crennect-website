import Link from 'next/link';
import Image from 'next/image';
import type { Portfolio } from '@/lib/types';

interface PortfolioCardProps {
  portfolio: Portfolio;
}

export default function PortfolioCard({ portfolio }: PortfolioCardProps) {
  const tags = portfolio.tags || [];

  return (
    <Link href={`/portfolio/${portfolio.slug}`} className="portfolio-card">
      <div className="portfolio-card-image">
        {portfolio.featured_image_url ? (
          <img
            src={portfolio.featured_image_url}
            alt={portfolio.title}
          />
        ) : (
          <div className="portfolio-card-placeholder">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>
      <div className="portfolio-card-content">
        <h3 className="portfolio-card-title">{portfolio.title}</h3>
        {portfolio.description && (
          <p className="portfolio-card-description">{portfolio.description}</p>
        )}
        {tags.length > 0 && (
          <div className="portfolio-card-tags">
            {tags.slice(0, 3).map((tagItem: any) => {
              const tag = tagItem.tags || tagItem;
              return (
                <span key={tag.id || tag.slug} className="portfolio-card-tag">
                  {tag.name}
                </span>
              );
            })}
            {tags.length > 3 && (
              <span className="portfolio-card-tag">+{tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

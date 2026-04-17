'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Tag } from '@/lib/types';

interface TagFilterProps {
  tags: Tag[];
}

export default function TagFilter({ tags }: TagFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  const toggleTag = (slug: string) => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    let newTags: string[];

    if (activeTags.includes(slug)) {
      newTags = activeTags.filter((t) => t !== slug);
    } else {
      newTags = [...activeTags, slug];
    }

    if (newTags.length > 0) {
      params.set('tags', newTags.join(','));
    } else {
      params.delete('tags');
    }
    params.delete('page');

    router.push(`/portfolio?${params.toString()}`);
  };

  const clearFilters = () => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tags');
    params.delete('search');
    params.delete('page');
    router.push(`/portfolio?${params.toString()}`);
  };

  const hasFilters = activeTags.length > 0 || searchParams.has('search');

  return (
    <div className={`portfolio-tags${loading ? ' portfolio-tags--loading' : ''}`}>
      {loading && (
        <span className="portfolio-tags-loader" aria-hidden="true" />
      )}
      {tags.map((tag) => (
        <button
          key={tag.id}
          className={`portfolio-tag ${activeTags.includes(tag.slug) ? 'active' : ''}`}
          onClick={() => toggleTag(tag.slug)}
          disabled={loading}
        >
          {tag.name}
        </button>
      ))}
      {hasFilters && (
        <button
          className="portfolio-tag"
          onClick={clearFilters}
          disabled={loading}
          style={{ background: 'transparent', border: '1px solid #e5e5e5' }}
        >
          Clear all
        </button>
      )}
    </div>
  );
}

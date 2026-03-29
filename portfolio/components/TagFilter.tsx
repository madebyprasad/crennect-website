'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Tag } from '@/lib/types';

interface TagFilterProps {
  tags: Tag[];
}

export default function TagFilter({ tags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

  const toggleTag = (slug: string) => {
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
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tags');
    params.delete('search');
    params.delete('page');
    router.push(`/portfolio?${params.toString()}`);
  };

  const hasFilters = activeTags.length > 0 || searchParams.has('search');

  return (
    <div className="portfolio-tags">
      {tags.map((tag) => (
        <button
          key={tag.id}
          className={`portfolio-tag ${activeTags.includes(tag.slug) ? 'active' : ''}`}
          onClick={() => toggleTag(tag.slug)}
        >
          {tag.name}
        </button>
      ))}
      {hasFilters && (
        <button
          className="portfolio-tag"
          onClick={clearFilters}
          style={{ background: 'transparent', border: '1px solid #e5e5e5' }}
        >
          Clear all
        </button>
      )}
    </div>
  );
}

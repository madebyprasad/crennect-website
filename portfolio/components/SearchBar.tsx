'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const debounce = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set('search', search);
      } else {
        params.delete('search');
      }
      params.delete('page');
      router.push(`/portfolio?${params.toString()}`);
    }, 300);

    return () => clearTimeout(debounce);
  }, [search, router, searchParams]);

  return (
    <div className="portfolio-search">
      <svg
        className="portfolio-search-icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        placeholder="Search portfolios..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}

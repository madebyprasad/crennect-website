'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Portfolio } from '@/lib/types';

interface DashboardTableProps {
  portfolios: Portfolio[];
}

export default function DashboardTable({ portfolios }: DashboardTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === portfolios.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(portfolios.map((p) => p.id)));
    }
  };

  const handleDeleteOne = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/portfolios/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      router.refresh();
    } catch {
      alert('Failed to delete portfolio');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} portfolio(s)? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      for (const id of Array.from(selected)) {
        const res = await fetch(`/api/portfolios/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Delete failed for ${id}`);
      }
      setSelected(new Set());
      router.refresh();
    } catch {
      alert('Failed to delete some portfolios');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {selected.size > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px',
            padding: '12px 16px',
            background: 'var(--bg-off-white)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: '14px' }}>{selected.size} selected</span>
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={deleting}
            style={{
              padding: '8px 16px',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: deleting ? 'not-allowed' : 'pointer',
            }}
          >
            {deleting ? 'Deleting...' : 'Delete Selected'}
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      )}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={portfolios.length > 0 && selected.size === portfolios.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Title</th>
              <th>Status</th>
              <th>Views</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {portfolios.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                  No portfolios yet.{' '}
                  <Link href="/admin/new" style={{ color: 'var(--accent)' }}>
                    Create your first one
                  </Link>
                </td>
              </tr>
            ) : (
              portfolios.map((portfolio) => (
                <tr key={portfolio.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(portfolio.id)}
                      onChange={() => toggleSelect(portfolio.id)}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{portfolio.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      /{portfolio.slug}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${portfolio.status}`}>
                      {portfolio.status}
                    </span>
                  </td>
                  <td>{portfolio.view_count || 0}</td>
                  <td>
                    {new Date(portfolio.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Link
                        href={`/admin/${portfolio.id}/edit`}
                        style={{
                          padding: '6px 12px',
                          background: 'var(--bg-off-white)',
                          borderRadius: '4px',
                          fontSize: '13px',
                        }}
                      >
                        Edit
                      </Link>
                      {portfolio.status === 'published' && (
                        <Link
                          href={`/portfolio/${portfolio.slug}`}
                          target="_blank"
                          style={{
                            padding: '6px 12px',
                            background: 'var(--bg-off-white)',
                            borderRadius: '4px',
                            fontSize: '13px',
                          }}
                        >
                          View
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteOne(portfolio.id, portfolio.title)}
                        disabled={deleting}
                        style={{
                          padding: '6px 12px',
                          background: 'transparent',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          fontSize: '13px',
                          cursor: deleting ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Delete
                      </button>
                      <span
                        title="Views"
                        style={{
                          padding: '6px 10px',
                          background: '#f5f5f5',
                          borderRadius: '4px',
                          fontSize: '13px',
                          color: '#666',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        👁 {(portfolio.view_count ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import type { Tag } from '@/lib/types';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      setTags(data);
    } catch (err) {
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create tag');
      }

      const tag = await response.json();
      setTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTagName('');
    } catch (err) {
      setError('Failed to create tag');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const response = await fetch(`/api/tags?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tag');
      }

      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError('Failed to delete tag');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Manage Tags</h1>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
            }}
          >
            {error}
          </div>
        )}

        {/* Create Tag Form */}
        <div className="admin-form" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Create New Tag
          </h2>
          <form onSubmit={handleCreateTag} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className="admin-form-input"
              placeholder="Tag name (e.g., Web Design)"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="portfolio-button portfolio-button-primary"
              disabled={creating || !newTagName.trim()}
            >
              {creating ? 'Creating...' : 'Create Tag'}
            </button>
          </form>
        </div>

        {/* Tags List */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                    Loading...
                  </td>
                </tr>
              ) : tags.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                    No tags yet. Create your first one above.
                  </td>
                </tr>
              ) : (
                tags.map((tag) => (
                  <tr key={tag.id}>
                    <td style={{ fontWeight: '600' }}>{tag.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{tag.slug}</td>
                    <td>
                      {new Date(tag.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        style={{
                          padding: '6px 12px',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          borderRadius: '4px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

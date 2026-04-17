'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import type { Portfolio } from '@/lib/types';

export default function TrashPage() {
  const [items, setItems] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [emptyingTrash, setEmptyingTrash] = useState(false);
  const [permanentTarget, setPermanentTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => { fetchTrash(); }, []);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portfolios?status=trashed');
      const data = await res.json();
      setItems(data.portfolios || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const restore = async (id: string) => {
    setProcessingId(id);
    try {
      await fetch(`/api/portfolios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft' }),
      });
      setItems(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Failed to restore');
    } finally {
      setProcessingId(null);
    }
  };

  const permanentDelete = async (id: string) => {
    setProcessingId(id);
    try {
      await fetch(`/api/portfolios/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Failed to delete permanently');
    } finally {
      setProcessingId(null);
      setPermanentTarget(null);
    }
  };

  const emptyTrash = async () => {
    if (!confirm(`Permanently delete all ${items.length} item(s) in trash? This CANNOT be undone.`)) return;
    setEmptyingTrash(true);
    try {
      await Promise.all(items.map(p => fetch(`/api/portfolios/${p.id}`, { method: 'DELETE' })));
      setItems([]);
    } catch {
      alert('Failed to empty trash');
    } finally {
      setEmptyingTrash(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">🗑️ Trash</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Items here can be restored or permanently deleted.
            </p>
          </div>
          {items.length > 0 && (
            <button type="button" onClick={emptyTrash} disabled={emptyingTrash}
              style={{ padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: emptyingTrash ? 'not-allowed' : 'pointer' }}>
              {emptyingTrash ? 'Emptying…' : `Empty Trash (${items.length})`}
            </button>
          )}
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Was</th>
                <th>Deleted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                  Trash is empty
                </td></tr>
              ) : items.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{p.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/{p.slug}</div>
                  </td>
                  <td>
                    {p.client_name && <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>{p.client_name}</span>}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {new Date(p.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button type="button" onClick={() => restore(p.id)} disabled={processingId === p.id}
                        style={{ padding: '6px 14px', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '6px', fontSize: '13px', cursor: processingId === p.id ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
                        {processingId === p.id ? '…' : '↩ Restore'}
                      </button>
                      <button type="button" onClick={() => setPermanentTarget({ id: p.id, title: p.title })} disabled={processingId === p.id}
                        style={{ padding: '6px 14px', background: 'transparent', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px', cursor: processingId === p.id ? 'not-allowed' : 'pointer' }}>
                        Delete Permanently
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permanent delete confirmation modal */}
      {permanentTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '36px 32px', maxWidth: '460px', width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px', textAlign: 'center' }}>⚠️</div>
            <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px', textAlign: 'center', color: '#dc2626' }}>Permanently Delete?</h3>
            <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '8px', textAlign: 'center' }}>
              <strong>&ldquo;{permanentTarget.title}&rdquo;</strong>
            </p>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px', textAlign: 'center' }}>
              This will <strong>permanently delete</strong> the portfolio and all its media. <br />
              <strong>This action cannot be undone.</strong>
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setPermanentTarget(null)} style={{ padding: '11px 24px', border: '1px solid #e5e5e5', borderRadius: '8px', cursor: 'pointer', background: '#fff', fontWeight: '500' }}>
                Cancel
              </button>
              <button type="button" onClick={() => permanentDelete(permanentTarget.id)} disabled={processingId === permanentTarget.id}
                style={{ padding: '11px 24px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>
                {processingId === permanentTarget.id ? 'Deleting…' : 'Yes, Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

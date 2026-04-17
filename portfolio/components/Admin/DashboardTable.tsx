'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Portfolio } from '@/lib/types';

interface DashboardTableProps {
  portfolios: Portfolio[];
}

function sortByOrder(list: Portfolio[]) {
  return [...list].sort((a, b) => {
    const aO = a.sort_order ?? Number.MAX_SAFE_INTEGER;
    const bO = b.sort_order ?? Number.MAX_SAFE_INTEGER;
    if (aO !== bO) return aO - bO;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export default function DashboardTable({ portfolios: rawPortfolios }: DashboardTableProps) {
  const router = useRouter();
  const [local, setLocal] = useState<Portfolio[]>(() => sortByOrder(rawPortfolios));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<string | null>(null);
  const [trashTarget, setTrashTarget] = useState<{ id: string; title: string } | null>(null);
  const [trashing, setTrashing] = useState(false);
  const [bulkTrashPending, setBulkTrashPending] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Sync when server re-renders with new data (after router.refresh)
  useEffect(() => {
    setLocal(sortByOrder(rawPortfolios));
  }, [rawPortfolios]);

  const patch = (id: string, body: object) =>
    fetch(`/api/portfolios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  // ── Sort: local-only swap; persist via Lock button ──────────────────
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setLocal(prev => {
      const arr = [...prev];
      const above = arr[idx - 1];
      const curr = arr[idx];
      const oA = above.sort_order ?? (idx - 1) * 10;
      const oC = curr.sort_order ?? idx * 10;
      arr[idx - 1] = { ...curr, sort_order: oA };
      arr[idx] = { ...above, sort_order: oC };
      return arr;
    });
    setPendingOrder(true);
  };

  const moveDown = (idx: number) => {
    if (idx >= local.length - 1) return;
    setLocal(prev => {
      const arr = [...prev];
      const curr = arr[idx];
      const below = arr[idx + 1];
      const oC = curr.sort_order ?? idx * 10;
      const oB = below.sort_order ?? (idx + 1) * 10;
      arr[idx] = { ...below, sort_order: oC };
      arr[idx + 1] = { ...curr, sort_order: oB };
      return arr;
    });
    setPendingOrder(true);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const res = await fetch('/api/admin/save-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: local.map(p => p.id) }),
      });
      if (!res.ok) throw new Error('Save failed');
      setPendingOrder(false);
      router.refresh();
    } catch {
      alert('Failed to save order. Please try again.');
    } finally {
      setSavingOrder(false);
    }
  };

  // ── Visibility toggle ────────────────────────────────────────────────
  const toggleVisibility = async (p: Portfolio) => {
    if (toggling) return;
    const newStatus = p.status === 'published' ? 'draft' : 'published';
    setToggling(p.id);
    setLocal(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus as any } : x));
    try {
      await patch(p.id, { status: newStatus });
      router.refresh();
    } catch {
      setLocal(prev => prev.map(x => x.id === p.id ? { ...x, status: p.status } : x));
    } finally {
      setToggling(null);
    }
  };

  // ── Soft-delete (trash) ──────────────────────────────────────────────
  const confirmTrash = async () => {
    if (!trashTarget) return;
    setTrashing(true);
    try {
      await patch(trashTarget.id, { status: 'trashed' });
      setLocal(prev => prev.filter(x => x.id !== trashTarget.id));
      setSelected(prev => { const n = new Set(prev); n.delete(trashTarget.id); return n; });
      router.refresh();
    } catch {
      alert('Failed to move to trash');
    } finally {
      setTrashing(false);
      setTrashTarget(null);
    }
  };

  // ── Bulk trash ───────────────────────────────────────────────────────
  const bulkTrash = async () => {
    if (!selected.size) return;
    setBulkTrashPending(true);
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map(id => patch(id, { status: 'trashed' })));
      setLocal(prev => prev.filter(x => !ids.includes(x.id)));
      setSelected(new Set());
      router.refresh();
    } catch {
      alert('Failed to move some items to trash');
    } finally {
      setBulkTrashPending(false);
    }
  };

  const toggleSelect = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleSelectAll = () =>
    setSelected(selected.size === local.length ? new Set() : new Set(local.map(p => p.id)));

  return (
    <>
      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', padding: '12px 16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
          <span style={{ fontSize: '14px' }}>{selected.size} selected</span>
          <button type="button" onClick={bulkTrash} disabled={bulkTrashPending}
            style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: bulkTrashPending ? 'not-allowed' : 'pointer' }}>
            {bulkTrashPending ? 'Moving...' : '🗑️ Move to Trash'}
          </button>
          <button type="button" onClick={() => setSelected(new Set())}
            style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
            Clear
          </button>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input type="checkbox" checked={local.length > 0 && selected.size === local.length} onChange={toggleSelectAll} />
              </th>
              <th style={{ width: '52px' }}>Order</th>
              <th>Title</th>
              <th>Status</th>
              <th>Views</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {local.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                No portfolios yet. <Link href="/admin/new" style={{ color: 'var(--accent)' }}>Create your first one</Link>
              </td></tr>
            ) : local.map((p, idx) => (
              <tr key={p.id}>
                <td><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0} title="Move up"
                      style={{ padding: '3px 8px', background: 'var(--bg-off-white)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1, lineHeight: 1 }}>▲</button>
                    <button type="button" onClick={() => moveDown(idx)} disabled={idx === local.length - 1} title="Move down"
                      style={{ padding: '3px 8px', background: 'var(--bg-off-white)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', cursor: idx === local.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === local.length - 1 ? 0.3 : 1, lineHeight: 1 }}>▼</button>
                    {pendingOrder && (
                      <button type="button" onClick={saveOrder} disabled={savingOrder} title="Lock & publish order"
                        style={{ padding: '3px 8px', background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: '4px', fontSize: '11px', cursor: savingOrder ? 'not-allowed' : 'pointer', lineHeight: 1 }}>
                        {savingOrder ? '…' : '🔒'}
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: '600' }}>{p.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/{p.slug}</div>
                </td>
                <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                <td>{p.view_count || 0}</td>
                <td>{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Link href={`/admin/${p.id}/edit`} style={{ padding: '6px 12px', background: 'var(--bg-off-white)', borderRadius: '4px', fontSize: '13px' }}>Edit</Link>
                    {p.status === 'published' && (
                      <Link href={`/portfolio/${p.slug}`} target="_blank" style={{ padding: '6px 12px', background: 'var(--bg-off-white)', borderRadius: '4px', fontSize: '13px' }}>View</Link>
                    )}
                    <button type="button" onClick={() => toggleVisibility(p)} disabled={toggling === p.id} title={p.status === 'published' ? 'Hide' : 'Publish'}
                      style={{ padding: '6px 10px', background: p.status === 'published' ? '#dcfce7' : '#f3f4f6', color: p.status === 'published' ? '#166534' : '#6b7280', border: '1px solid', borderColor: p.status === 'published' ? '#86efac' : '#d1d5db', borderRadius: '4px', fontSize: '13px', cursor: toggling === p.id ? 'not-allowed' : 'pointer' }}>
                      {toggling === p.id ? '…' : p.status === 'published' ? '👁 Visible' : '🚫 Hidden'}
                    </button>
                    <button type="button" onClick={() => setTrashTarget({ id: p.id, title: p.title })}
                      style={{ padding: '6px 12px', background: 'transparent', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
                      🗑️
                    </button>
                    <span title="Total views" style={{ padding: '6px 10px', background: '#f5f5f5', borderRadius: '4px', fontSize: '13px', color: '#666', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      👁 {(p.view_count ?? 0).toLocaleString()}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trash warning modal */}
      {trashTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '36px 32px', maxWidth: '460px', width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px', textAlign: 'center' }}>🗑️</div>
            <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px', textAlign: 'center' }}>Move to Trash?</h3>
            <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '8px', textAlign: 'center' }}>
              <strong>&ldquo;{trashTarget.title}&rdquo;</strong> will be moved to Trash.
            </p>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px', textAlign: 'center' }}>
              You can restore it or permanently delete it from the <strong>Trash</strong> section in the sidebar.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setTrashTarget(null)} disabled={trashing}
                style={{ padding: '11px 24px', border: '1px solid #e5e5e5', borderRadius: '8px', cursor: 'pointer', background: '#fff', fontWeight: '500' }}>
                Cancel
              </button>
              <button type="button" onClick={confirmTrash} disabled={trashing}
                style={{ padding: '11px 24px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: trashing ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '15px' }}>
                {trashing ? 'Moving…' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

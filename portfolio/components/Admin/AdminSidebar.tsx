'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/new', label: 'New Portfolio', icon: '➕' },
    { href: '/admin/tags', label: 'Manage Tags', icon: '🏷️' },
    { href: '/admin/trash', label: 'Trash', icon: '🗑️' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <Link href="/portfolio">
          <img src="/assets/images/logo.svg" alt="Crennect" />
        </Link>
      </div>

      <nav className="admin-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                if (item.href === '/admin' && pathname === '/admin') {
                  e.preventDefault();
                  router.refresh();
                }
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Link
          href="/portfolio"
          className="admin-nav-item"
          target="_blank"
        >
          <span>🌐</span>
          <span>View Site</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="admin-nav-item"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

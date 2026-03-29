import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAllPortfolios } from '@/lib/db';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import DashboardTable from '@/components/Admin/DashboardTable';

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  const portfolios = await getAllPortfolios();

  const publishedCount = portfolios.filter((p) => p.status === 'published').length;
  const draftCount = portfolios.filter((p) => p.status === 'draft').length;
  const totalViews = portfolios.reduce((sum, p) => sum + (p.view_count ?? 0), 0);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Dashboard</h1>
          <Link href="/admin/new" className="portfolio-button portfolio-button-primary">
            + New Portfolio
          </Link>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-value">{portfolios.length}</div>
            <div className="admin-stat-label">Total Portfolios</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{publishedCount}</div>
            <div className="admin-stat-label">Published</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{draftCount}</div>
            <div className="admin-stat-label">Drafts</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{totalViews.toLocaleString()}</div>
            <div className="admin-stat-label">Total Views</div>
          </div>
        </div>

        {/* Portfolios Table */}
        <DashboardTable portfolios={portfolios} />
      </div>
    </div>
  );
}

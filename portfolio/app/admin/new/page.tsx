import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllTags } from '@/lib/db';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import PortfolioForm from '@/components/Admin/PortfolioForm';

export default async function NewPortfolioPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  const tags = await getAllTags();

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Create New Portfolio</h1>
        </div>

        <PortfolioForm tags={tags} />
      </div>
    </div>
  );
}

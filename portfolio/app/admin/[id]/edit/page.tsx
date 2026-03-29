import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getPortfolioById, getAllTags } from '@/lib/db';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import PortfolioForm from '@/components/Admin/PortfolioForm';

interface PageProps {
  params: { id: string };
}

export default async function EditPortfolioPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  const [portfolio, tags] = await Promise.all([
    getPortfolioById(params.id),
    getAllTags(),
  ]);

  if (!portfolio) {
    notFound();
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Edit Portfolio</h1>
        </div>

        <PortfolioForm portfolio={portfolio} tags={tags} />
      </div>
    </div>
  );
}

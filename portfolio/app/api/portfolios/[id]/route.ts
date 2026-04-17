import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { getPortfolioById, updatePortfolio, deletePortfolio, incrementPortfolioView, supabaseAdmin } from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

function invalidate() {
  try { revalidateTag('portfolios'); } catch {}
  try { revalidatePath('/portfolio', 'page'); } catch {}
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const portfolio = await getPortfolioById(params.id);
    if (!portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    return NextResponse.json(portfolio);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const portfolio = await getPortfolioById(params.id);
    if (!portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });

    const body = await request.json();
    if (!body.project_date || body.project_date === '') {
      return NextResponse.json({ error: 'Project date is required' }, { status: 400 });
    }

    const updated = await updatePortfolio(
      params.id,
      {
        title: body.title,
        description: body.description,
        client_name: body.client_name,
        project_date: body.project_date,
        challenge_content: body.challenge_content,
        strategy_content: body.strategy_content,
        closing_content: body.closing_content,
        featured_image_url: body.featured_image_url,
        status: body.status,
        gallery_layout: body.gallery_layout,
        published_at:
          body.status === 'published' && portfolio.status !== 'published'
            ? new Date().toISOString()
            : portfolio.published_at,
      },
      body.tags
    );

    invalidate();
    try { revalidatePath(`/portfolio/${portfolio.slug}`, 'page'); } catch {}
    return NextResponse.json(updated);
  } catch (error: any) {
    const message = error?.message || '';
    if (message.toLowerCase().includes('project_date') || message.toLowerCase().includes('date')) {
      return NextResponse.json({ error: 'Project date is required' }, { status: 400 });
    }
    return NextResponse.json({ error: error?.message || 'Failed to update portfolio' }, { status: 500 });
  }
}

// PATCH: sort_order | status toggle | view count increment
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    let body: any = null;
    try { body = await request.json(); } catch {}

    if (body?.sort_order !== undefined) {
      const session = await auth();
      if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (supabaseAdmin) {
        const { error } = await supabaseAdmin
          .from('portfolios')
          .update({ sort_order: body.sort_order })
          .eq('id', params.id);
        if (error && !error.message?.includes('sort_order')) throw error;
      }
      invalidate();
      return NextResponse.json({ ok: true });
    }

    if (body?.status !== undefined) {
      const session = await auth();
      if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const updates: any = { status: body.status, updated_at: new Date().toISOString() };
      if (body.status === 'published') updates.published_at = new Date().toISOString();
      else if (body.status !== 'trashed') updates.published_at = null;
      if (supabaseAdmin) {
        await supabaseAdmin.from('portfolios').update(updates).eq('id', params.id);
      }
      invalidate();
      return NextResponse.json({ ok: true });
    }

    await incrementPortfolioView(params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const portfolio = await getPortfolioById(params.id);
    if (!portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });

    await deletePortfolio(params.id);
    invalidate();
    try { revalidatePath(`/portfolio/${portfolio.slug}`, 'page'); } catch {}
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPortfolioById, updatePortfolio, deletePortfolio } from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const portfolio = await getPortfolioById(params.id);

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolio = await getPortfolioById(params.id);

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const body = await request.json();

    if (!body.project_date || body.project_date === '') {
      return NextResponse.json(
        { error: 'Project date is required' },
        { status: 400 }
      );
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

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating portfolio:', error);
    const message = error?.message || '';
    if (message.toLowerCase().includes('project_date') || message.toLowerCase().includes('date')) {
      return NextResponse.json(
        { error: 'Project date is required' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolio = await getPortfolioById(params.id);

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    await deletePortfolio(params.id);

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio' },
      { status: 500 }
    );
  }
}

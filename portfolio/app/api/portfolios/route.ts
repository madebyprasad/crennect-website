import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPublishedPortfolios, createPortfolio } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const result = await getPublishedPortfolios({ search, tags, page, limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!body.project_date || body.project_date === '') {
      return NextResponse.json(
        { error: 'Project date is required' },
        { status: 400 }
      );
    }

    const portfolio = await createPortfolio(
      {
        title: body.title,
        description: body.description,
        client_name: body.client_name,
        project_date: body.project_date,
        challenge_content: body.challenge_content,
        strategy_content: body.strategy_content,
        closing_content: body.closing_content,
        featured_image_url: body.featured_image_url,
        status: body.status || 'draft',
        published_at: body.status === 'published' ? new Date().toISOString() : null,
        gallery_layout: body.gallery_layout,
      },
      body.tags || [],
      session.user.id
    );

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error: any) {
    console.error('Error creating portfolio:', error);
    const message = error?.message || '';
    if (message.toLowerCase().includes('project_date') || message.toLowerCase().includes('date')) {
      return NextResponse.json(
        { error: 'Project date is required' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}

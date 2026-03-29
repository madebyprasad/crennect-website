import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Portfolio, Tag, PortfolioMedia } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export const supabaseAdmin: SupabaseClient | null = isConfigured
  ? createClient(
      supabaseUrl!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey!
    )
  : null;


  
const DEMO_PORTFOLIOS: Portfolio[] = [
  {
    id: '1',
    title: 'Brand Strategy for TechCorp',
    slug: 'brand-strategy-techcorp',
    description: 'A comprehensive brand refresh that helped TechCorp establish market leadership.',
    client_name: 'TechCorp Inc.',
    project_date: '2025-06-15',
    challenge_content: 'TechCorp was struggling to differentiate itself in a crowded market. Their brand messaging was unclear and failed to resonate with their target audience.',
    strategy_content: 'We developed a comprehensive brand strategy that included new positioning, messaging framework, and visual identity guidelines. The focus was on highlighting their innovative approach to technology.',
    closing_content: 'The rebrand resulted in a 40% increase in brand recognition and 25% improvement in lead quality.',
    featured_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    status: 'published',
    view_count: 1250,
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-15T00:00:00Z',
    published_at: '2025-06-15T00:00:00Z',
    created_by: 'demo',
    tags: [
      { id: '1', name: 'Brand Strategy', slug: 'brand-strategy', created_at: '' },
      { id: '2', name: 'Visual Identity', slug: 'visual-identity', created_at: '' },
    ],
  },
  {
    id: '2',
    title: 'Digital Campaign for FoodieApp',
    slug: 'digital-campaign-foodieapp',
    description: 'A multi-channel digital marketing campaign that drove app downloads and user engagement.',
    client_name: 'FoodieApp',
    project_date: '2025-08-20',
    challenge_content: 'FoodieApp needed to increase app downloads and user engagement in a competitive food delivery market.',
    strategy_content: 'We created a comprehensive digital campaign spanning social media, influencer partnerships, and targeted advertising focused on local food discovery.',
    closing_content: 'The campaign achieved 500K+ downloads in 3 months with a 35% user retention rate.',
    featured_image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop',
    status: 'published',
    view_count: 890,
    created_at: '2025-08-01T00:00:00Z',
    updated_at: '2025-08-20T00:00:00Z',
    published_at: '2025-08-20T00:00:00Z',
    created_by: 'demo',
    tags: [
      { id: '3', name: 'Digital Marketing', slug: 'digital-marketing', created_at: '' },
      { id: '4', name: 'Social Media', slug: 'social-media', created_at: '' },
    ],
  },
  {
    id: '3',
    title: 'AI-Powered Content System',
    slug: 'ai-powered-content-system',
    description: 'An intelligent content creation system that automates brand-consistent marketing materials.',
    client_name: 'MediaPro Agency',
    project_date: '2025-10-05',
    challenge_content: 'MediaPro needed to scale their content production without sacrificing quality or brand consistency across multiple client accounts.',
    strategy_content: 'We built a custom AI-powered content system that learns each client\'s brand voice and generates on-brand content at scale with human oversight.',
    closing_content: 'The system reduced content production time by 60% while maintaining quality standards.',
    featured_image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop',
    status: 'published',
    view_count: 2100,
    created_at: '2025-09-15T00:00:00Z',
    updated_at: '2025-10-05T00:00:00Z',
    published_at: '2025-10-05T00:00:00Z',
    created_by: 'demo',
    tags: [
      { id: '6', name: 'AI Solutions', slug: 'ai-solutions', created_at: '' },
      { id: '7', name: 'Content Strategy', slug: 'content-strategy', created_at: '' },
    ],
  },
];

const DEMO_TAGS: Tag[] = [
  { id: '1', name: 'Brand Strategy', slug: 'brand-strategy', created_at: '' },
  { id: '2', name: 'Visual Identity', slug: 'visual-identity', created_at: '' },
  { id: '3', name: 'Digital Marketing', slug: 'digital-marketing', created_at: '' },
  { id: '4', name: 'Social Media', slug: 'social-media', created_at: '' },
  { id: '5', name: 'Web Design', slug: 'web-design', created_at: '' },
  { id: '6', name: 'AI Solutions', slug: 'ai-solutions', created_at: '' },
  { id: '7', name: 'Content Strategy', slug: 'content-strategy', created_at: '' },
  { id: '8', name: 'Campaign', slug: 'campaign', created_at: '' },
];

export async function getPublishedPortfolios(params?: {
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}) {
  const { search, tags, page = 1, limit = 12 } = params || {};
  const offset = (page - 1) * limit;

  if (!supabase) {
    let filtered = DEMO_PORTFOLIOS.filter(p => p.status === 'published');
    
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        p.challenge_content?.toLowerCase().includes(s) ||
        p.strategy_content?.toLowerCase().includes(s) ||
        p.closing_content?.toLowerCase().includes(s)
      );
    }
    
    if (tags && tags.length > 0) {
      filtered = filtered.filter(p => 
        p.tags?.some(t => tags.includes(t.slug))
      );
    }
    
    const total = filtered.length;
    const paged = filtered.slice(offset, offset + limit);
    
    return {
      portfolios: paged,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  let query = supabase
    .from('portfolios')
    .select(`
      *,
      portfolio_tags(tag_id),
      tags:portfolio_tags(tags(*))
    `, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,challenge_content.ilike.%${search}%,strategy_content.ilike.%${search}%,closing_content.ilike.%${search}%`
    );
  }

  if (tags && tags.length > 0) {
    const { data: tagData } = await supabase
      .from('tags')
      .select('id')
      .in('slug', tags);
    
    if (tagData && tagData.length > 0) {
      const tagIds = tagData.map(t => t.id);
      const { data: portfolioIds } = await supabase
        .from('portfolio_tags')
        .select('portfolio_id')
        .in('tag_id', tagIds);
      const ids = Array.from(new Set((portfolioIds || []).map((r: { portfolio_id: string }) => r.portfolio_id)));
      if (ids.length > 0) {
        query = query.in('id', ids);
      } else {
        return { portfolios: [], total: 0, page, totalPages: 0 };
      }
    }
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    portfolios: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getPortfolioBySlug(slug: string): Promise<Portfolio | null> {
  if (!supabase) {
    const portfolio = DEMO_PORTFOLIOS.find(p => p.slug === slug && p.status === 'published');
    return portfolio || null;
  }

  const { data, error } = await supabase
    .from('portfolios')
    .select(`
      *,
      tags:portfolio_tags(tags(*)),
      media:portfolio_media(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;

  await supabase
    .from('portfolios')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', data.id);

  return data;
}

export async function getSuggestedPortfolios(
  excludeSlug: string,
  limit = 2
): Promise<Portfolio[]> {
  if (!supabase) {
    return DEMO_PORTFOLIOS
      .filter((p) => p.status === 'published' && p.slug !== excludeSlug)
      .slice(0, limit);
  }

  const { data, error } = await supabase
    .from('portfolios')
    .select(`
      *,
      portfolio_tags(tag_id),
      tags:portfolio_tags(tags(*))
    `)
    .eq('status', 'published')
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data || [];
}

export async function getAllPortfolios(): Promise<Portfolio[]> {
  if (!supabaseAdmin) {
    return DEMO_PORTFOLIOS;
  }

  const { data, error } = await supabaseAdmin
    .from('portfolios')
    .select(`
      *,
      tags:portfolio_tags(tags(*)),
      media:portfolio_media(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPortfolioById(id: string): Promise<Portfolio | null> {
  if (!supabaseAdmin) {
    return DEMO_PORTFOLIOS.find(p => p.id === id) || null;
  }

  const { data, error } = await supabaseAdmin
    .from('portfolios')
    .select(`
      *,
      tags:portfolio_tags(tags(*)),
      media:portfolio_media(*)
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createPortfolio(
  portfolio: Partial<Portfolio>,
  tagIds: string[],
  userId: string
): Promise<Portfolio> {
  if (!supabaseAdmin) throw new Error('Database not configured');

  const slug = generateSlug(portfolio.title || 'untitled');

  const payload: any = { ...portfolio, slug, created_by: userId, status: 'draft' };

  let result = await supabaseAdmin.from('portfolios').insert(payload).select().single();

  // Retry without gallery_layout if the column doesn't exist yet
  if (result.error?.message?.includes('gallery_layout')) {
    const { gallery_layout, ...withoutLayout } = payload;
    result = await supabaseAdmin.from('portfolios').insert(withoutLayout).select().single();
  }

  const { data, error } = result;
  if (error) throw error;

  if (tagIds.length > 0) {
    await supabaseAdmin.from('portfolio_tags').insert(
      tagIds.map(tagId => ({
        portfolio_id: data.id,
        tag_id: tagId,
      }))
    );
  }

  return data;
}

export async function updatePortfolio(
  id: string,
  portfolio: Partial<Portfolio>,
  tagIds?: string[]
): Promise<Portfolio> {
  if (!supabaseAdmin) throw new Error('Database not configured');

  const payload: any = { ...portfolio, updated_at: new Date().toISOString() };

  let result = await supabaseAdmin.from('portfolios').update(payload).eq('id', id).select().single();

  // Retry without gallery_layout if the column doesn't exist yet
  if (result.error?.message?.includes('gallery_layout')) {
    const { gallery_layout, ...withoutLayout } = payload;
    result = await supabaseAdmin.from('portfolios').update(withoutLayout).eq('id', id).select().single();
  }

  const { data, error } = result;
  if (error) throw error;

  if (tagIds !== undefined) {
    await supabaseAdmin
      .from('portfolio_tags')
      .delete()
      .eq('portfolio_id', id);

    if (tagIds.length > 0) {
      await supabaseAdmin.from('portfolio_tags').insert(
        tagIds.map(tagId => ({
          portfolio_id: id,
          tag_id: tagId,
        }))
      );
    }
  }

  return data;
}

export async function publishPortfolio(id: string): Promise<Portfolio> {
  return updatePortfolio(id, {
    status: 'published',
    published_at: new Date().toISOString(),
  });
}

export async function unpublishPortfolio(id: string): Promise<Portfolio> {
  return updatePortfolio(id, {
    status: 'draft',
    published_at: null,
  });
}

export async function deletePortfolio(id: string): Promise<void> {
  if (!supabaseAdmin) throw new Error('Database not configured');

  await supabaseAdmin.from('portfolio_media').delete().eq('portfolio_id', id);
  await supabaseAdmin.from('portfolio_tags').delete().eq('portfolio_id', id);
  const { error } = await supabaseAdmin.from('portfolios').delete().eq('id', id);

  if (error) throw error;
}

export async function getAllTags(): Promise<Tag[]> {
  if (!supabase) {
    return DEMO_TAGS;
  }

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createTag(name: string): Promise<Tag> {
  if (!supabaseAdmin) throw new Error('Database not configured');

  const slug = generateSlug(name);

  const { data, error } = await supabaseAdmin
    .from('tags')
    .insert({ name, slug })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTag(id: string): Promise<void> {
  if (!supabaseAdmin) throw new Error('Database not configured');

  const { error } = await supabaseAdmin.from('tags').delete().eq('id', id);
  if (error) throw error;
}

export async function addPortfolioMedia(
  portfolioId: string,
  media: Partial<PortfolioMedia>
): Promise<PortfolioMedia> {
  if (!supabaseAdmin) throw new Error('Database not configured');

  const { data: existing } = await supabaseAdmin
    .from('portfolio_media')
    .select('sort_order')
    .eq('portfolio_id', portfolioId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? (existing[0].sort_order || 0) + 1 : 0;

  const { data, error } = await supabaseAdmin
    .from('portfolio_media')
    .insert({
      ...media,
      portfolio_id: portfolioId,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePortfolioMedia(mediaId: string): Promise<void> {
  if (!supabaseAdmin) throw new Error('Database not configured');

  const { error } = await supabaseAdmin
    .from('portfolio_media')
    .delete()
    .eq('id', mediaId);

  if (error) throw error;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

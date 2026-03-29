export interface Portfolio {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  client_name: string | null;
  project_date: string | null;
  challenge_content: string | null;
  strategy_content: string | null;
  closing_content: string | null;
  featured_image_url: string | null;
  status: 'draft' | 'published' | 'archived';
  gallery_layout?: 'stack' | 'uniform' | 'full-width' | '2-column';
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  created_by: string;
  tags?: Tag[];
  media?: PortfolioMedia[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface PortfolioTag {
  portfolio_id: string;
  tag_id: string;
}

export interface PortfolioMedia {
  id: string;
  portfolio_id: string;
  media_type: 'image' | 'video' | 'embed' | 'text' | 'link';
  content_url: string | null;
  content_text: string | null;
  title: string | null;
  caption: string | null;
  alt_text: string | null;
  embed_code: string | null;
  sort_order: number | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'editor';
}

export interface PortfolioFormData {
  title: string;
  description: string;
  client_name: string;
  project_date: string;
  challenge_content: string;
  strategy_content: string;
  closing_content: string;
  gallery_layout: string;
  tags: string[];
  featured_image?: File;
}

export interface SearchParams {
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

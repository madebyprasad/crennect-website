# Crennect Portfolio

A modern portfolio website built with Next.js 14, Supabase, and Cloudinary.

## Features

- **Public Portfolio Library** - Browse and search case studies
- **Case Study Detail Pages** - Rich content with media galleries
- **Admin Dashboard** - Create, edit, and publish portfolios
- **Tag-based Filtering** - Organize and filter portfolios by categories
- **Media Management** - Image and video uploads via Cloudinary
- **Authentication** - Secure admin access with NextAuth.js

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudinary
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS + Custom CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- Cloudinary account

### 1. Install Dependencies

```bash
cd portfolio
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `NEXTAUTH_URL` - Your app URL

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the schema from `supabase/schema.sql`

### 4. Create Admin User

In Supabase Authentication:
1. Go to Authentication > Users
2. Click "Add user"
3. Enter email and password for your admin account

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

## Project Structure

```
portfolio/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth routes
│   │   ├── portfolios/     # Portfolio CRUD
│   │   ├── tags/           # Tag management
│   │   └── upload/         # Media uploads
│   ├── admin/              # Admin dashboard pages
│   │   ├── login/
│   │   ├── new/
│   │   ├── tags/
│   │   └── [id]/edit/
│   ├── portfolio/          # Public portfolio pages
│   │   └── [slug]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Admin/              # Admin components
│   │   ├── AdminSidebar.tsx
│   │   └── PortfolioForm.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── PortfolioCard.tsx
│   ├── SearchBar.tsx
│   └── TagFilter.tsx
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── cloudinary.ts       # Cloudinary utilities
│   ├── db.ts               # Supabase client & queries
│   └── types.ts            # TypeScript types
├── supabase/
│   └── schema.sql          # Database schema
└── public/
    └── assets/             # Static assets
```

## URLs

- `/portfolio` - Portfolio library (public)
- `/portfolio/[slug]` - Case study detail (public)
- `/admin` - Admin dashboard (requires login)
- `/admin/login` - Admin login
- `/admin/new` - Create new portfolio
- `/admin/[id]/edit` - Edit portfolio
- `/admin/tags` - Manage tags

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Custom Domain

In Vercel settings, add your custom domain and configure DNS.

## Design System

This portfolio follows the Crennect design system:

- **Colors**: White, Black, Green (#00ff00)
- **Fonts**: Inter, Playfair Display, Jersey 20
- **Spacing**: 8px base unit
- **Border Radius**: 4px, 8px, 16px, 999px

CSS classes use `.portfolio-*` prefix to avoid conflicts with the main site.

## License

Private - Crennect © 2025

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { savePortfolioOrder } from '@/lib/db';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!Array.isArray(body.order)) return NextResponse.json({ error: 'Invalid order' }, { status: 400 });

  await savePortfolioOrder(body.order);

  try { revalidateTag('portfolios'); } catch {}
  try { revalidatePath('/portfolio', 'page'); } catch {}

  return NextResponse.json({ ok: true });
}

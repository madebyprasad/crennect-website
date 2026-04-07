import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadImage, uploadVideo, deleteMedia } from '@/lib/cloudinary';
import { supabaseAdmin, addPortfolioMedia, deletePortfolioMedia } from '@/lib/db';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const isCloudinaryConfigured = () => {
  const name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  return !!(name && key && secret && name !== 'your_cloud_name' && key !== 'your_api_key');
};

const BUCKET_NAME = 'portfolio';

async function ensureBucketExists() {
  if (!supabaseAdmin) return;
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b: { name: string }) => b.name === BUCKET_NAME);
    if (!exists) {
      const { error } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
      });
      if (error) throw new Error(`Could not create bucket: ${error.message}`);
    }
  } catch (e: any) {
    if (e?.message?.includes('create bucket')) throw e;
  }
}

async function uploadToSupabaseStorage(
  file: File,
  buffer: Buffer,
  folder: string
): Promise<{ url: string; publicId: string }> {
  if (!supabaseAdmin) throw new Error('Database not configured');
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  let result = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (result.error) {
    const isBucketError =
      result.error.message?.includes('Bucket') ||
      result.error.message?.includes('not found') ||
      result.error.message?.includes('404') ||
      result.error.message?.includes('does not exist');
    if (isBucketError) {
      await ensureBucketExists();
      result = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(path, buffer, { contentType: file.type, upsert: false });
    }
    if (result.error) throw new Error(result.error.message);
  }

  const { data } = result;
  const { data: urlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(data.path);
  return { url: urlData.publicUrl, publicId: data.path };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const portfolioId = formData.get('portfolioId') as string;
    const title = (formData.get('title') as string) || file?.name || '';
    const caption = formData.get('caption') as string;
    const altText = formData.get('altText') as string;
    const linkUrl = formData.get('link_url') as string | null;
    const textContent = formData.get('text_content') as string | null;

    const heroVideoUrl = formData.get('hero_video_url') as string | null;

    if (heroVideoUrl) {
      if (!portfolioId) {
        return NextResponse.json({ error: 'portfolioId is required for hero video' }, { status: 400 });
      }
      const media = await addPortfolioMedia(portfolioId, {
        media_type: 'video',
        content_url: heroVideoUrl,
        content_text: null,
        title: null,
        alt_text: 'hero-video',
        sort_order: -1,
      });
      return NextResponse.json({ mediaId: media.id, url: heroVideoUrl });
    }

    if (linkUrl || textContent) {
      if (!portfolioId) {
        return NextResponse.json({ error: 'portfolioId is required for links and text sections' }, { status: 400 });
      }
      const media = await addPortfolioMedia(portfolioId, {
        media_type: linkUrl ? 'link' : 'text',
        content_url: linkUrl || null,
        content_text: textContent || null,
        title: title || null,
      });
      return NextResponse.json({ mediaId: media.id, url: linkUrl || null });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: jpg, png, webp, gif, mp4, webm' },
        { status: 400 }
      );
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: 'Image too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: 'Video too large. Maximum size is 100MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const useCloudinary = isCloudinaryConfigured();

    let result: { url: string; publicId: string };
    if (useCloudinary) {
      if (isImage) {
        result = await uploadImage(buffer);
      } else {
        result = await uploadVideo(buffer);
      }
    } else {
      result = await uploadToSupabaseStorage(
        file,
        buffer,
        portfolioId ? (isImage ? 'media/images' : 'media/videos') : 'thumbnails'
      );
    }

    if (portfolioId) {
      const media = await addPortfolioMedia(portfolioId, {
        media_type: isImage ? 'image' : 'video',
        content_url: result.url,
        title,
        caption,
        alt_text: altText,
      });

      return NextResponse.json({
        ...result,
        mediaId: media.id,
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error uploading file:', error);
    let message = error?.message || error?.error || 'Failed to upload file';
    if (
      (message.includes('Bucket') || message.includes('not found') || message.includes('404') || message.includes('does not exist')) &&
      !message.includes('Create it')
    ) {
      message =
        'Storage bucket "portfolio" not found. Enable Storage in Supabase and create a public bucket named "portfolio", or add Cloudinary credentials to .env.local.';
    }
    return NextResponse.json(
      { error: String(message) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    const mediaId = searchParams.get('mediaId');
    const resourceType = (searchParams.get('type') as 'image' | 'video') || 'image';

    if (!publicId && !mediaId) {
      return NextResponse.json(
        { error: 'publicId or mediaId is required' },
        { status: 400 }
      );
    }

    if (publicId) {
      await deleteMedia(publicId, resourceType);
    }

    if (mediaId) {
      await deletePortfolioMedia(mediaId);
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadImage(file: Buffer, options?: {
  folder?: string;
  public_id?: string;
}) {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: options?.folder || 'portfolio',
        public_id: options?.public_id,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    ).end(file);
  });
}

export async function uploadVideo(file: Buffer, options?: {
  folder?: string;
  public_id?: string;
}) {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: options?.folder || 'portfolio/videos',
        public_id: options?.public_id,
        resource_type: 'video',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    ).end(file);
  });
}

export async function deleteMedia(publicId: string, resourceType: 'image' | 'video' = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export function getOptimizedUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  crop?: string;
}) {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    width: options?.width,
    height: options?.height,
    crop: options?.crop || 'fill',
  });
}

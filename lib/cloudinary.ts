import { v2 as cloudinaryBase } from 'cloudinary';

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) return;
  
  // Validate required environment variables
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Missing CLOUDINARY_CLOUD_NAME environment variable');
  }
  if (!process.env.CLOUDINARY_API_KEY) {
    throw new Error('Missing CLOUDINARY_API_KEY environment variable');
  }
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Missing CLOUDINARY_API_SECRET environment variable');
  }

  cloudinaryBase.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  isConfigured = true;
}

// Export a proxy that ensures configuration on first use
export const cloudinary = new Proxy(cloudinaryBase, {
  get(target, prop) {
    ensureConfigured();
    return (target as any)[prop];
  }
});

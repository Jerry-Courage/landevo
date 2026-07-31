import { randomUUID } from 'crypto';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super('Object not found');
    this.name = 'ObjectNotFoundError';
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  /**
   * Upload a file buffer to Cloudinary.
   * Returns the secure CDN URL (uploadURL) and the Cloudinary public_id (objectPath).
   */
  async uploadBuffer(
    buffer: Buffer,
    options: { contentType?: string } = {},
  ): Promise<{ uploadURL: string; objectPath: string }> {
    const publicId = `landevo/uploads/${randomUUID()}`;

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: 'auto',
          overwrite: false,
        },
        (error, res) => {
          if (error || !res) reject(error ?? new Error('Cloudinary upload failed'));
          else resolve(res);
        },
      );
      stream.end(buffer);
    });

    return {
      uploadURL: result.secure_url,
      objectPath: result.public_id,
    };
  }

  /**
   * Build a Cloudinary CDN URL from a stored public_id.
   * Supports both legacy full URLs (pass-through) and Cloudinary public_ids.
   */
  getDeliveryUrl(objectPath: string): string {
    if (objectPath.startsWith('https://') || objectPath.startsWith('http://')) {
      return objectPath;
    }
    return cloudinary.url(objectPath, { resource_type: 'auto', secure: true });
  }

  /**
   * Download an object by its objectPath (public_id or full URL) and return it
   * as a fetch Response, ready to be streamed to the client.
   */
  async downloadObject(
    objectPath: string,
    cacheTtlSec = 3600,
  ): Promise<Response> {
    const url = this.getDeliveryUrl(objectPath);
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new ObjectNotFoundError();

    // Pass through Content-Type; set cache headers.
    const headers = new Headers();
    const ct = res.headers.get('Content-Type');
    if (ct) headers.set('Content-Type', ct);
    headers.set('Cache-Control', `private, max-age=${cacheTtlSec}`);

    return new Response(res.body, { headers });
  }

  /**
   * Resolve an objectPath to something downloadObject() can use.
   * For Cloudinary the objectPath IS the identifier — return as-is.
   */
  async getObjectEntityFile(objectPath: string): Promise<string> {
    return objectPath;
  }

  /**
   * No-op for Cloudinary: ACL is managed via signed URLs or Cloudinary access controls.
   */
  async trySetObjectEntityAclPolicy(objectPath: string): Promise<string> {
    return objectPath;
  }

  /**
   * No-op for Cloudinary: auth is enforced at the route level.
   */
  async canAccessObjectEntity(): Promise<boolean> {
    return true;
  }
}

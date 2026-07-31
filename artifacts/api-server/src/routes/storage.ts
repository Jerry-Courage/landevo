import { Readable } from 'stream';
import multer from 'multer';
import { Router, type IRouter, type Request, type Response } from 'express';
import { ObjectNotFoundError, ObjectStorageService } from '../lib/objectStorage';

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

// Store uploads in memory (files are streamed straight to Cloudinary).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

/**
 * POST /storage/uploads
 * Upload a file directly to Cloudinary. Requires an active session.
 * Accepts multipart/form-data with:
 *   - file   : the binary file
 *   - name   : original filename
 *   - contentType : MIME type
 *   - size   : file size in bytes
 *
 * Returns: { uploadURL, objectPath, metadata }
 *   uploadURL  — Cloudinary CDN URL (use this to display the image)
 *   objectPath — Cloudinary public_id (store this in your DB)
 */
router.post(
  '/storage/uploads',
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.session.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const { name, contentType, size: rawSize } = req.body as Record<string, string>;
    if (!name || !contentType || !rawSize) {
      res.status(400).json({ error: 'Missing required fields: name, contentType, size' });
      return;
    }
    const size = Number(rawSize);
    if (!Number.isInteger(size) || size < 1) {
      res.status(400).json({ error: 'size must be a positive integer' });
      return;
    }

    try {
      const { uploadURL, objectPath } = await objectStorageService.uploadBuffer(
        req.file.buffer,
        { contentType },
      );

      res.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  },
);

/**
 * GET /storage/objects/*objectPath
 * Serve a private uploaded object by its Cloudinary public_id or URL.
 * Requires session auth.
 */
router.get('/storage/objects/*objectPath', async (req: Request, res: Response) => {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const raw = req.params.objectPath;
    const objectPath = Array.isArray(raw) ? raw.join('/') : raw;

    const file = await objectStorageService.getObjectEntityFile(objectPath);
    const response = await objectStorageService.downloadObject(file, 3600);

    const ct = response.headers.get('Content-Type');
    if (ct) res.setHeader('Content-Type', ct);
    const cc = response.headers.get('Cache-Control');
    if (cc) res.setHeader('Cache-Control', cc);

    const body = response.body;
    if (!body) {
      res.status(500).json({ error: 'Empty response body' });
      return;
    }

    Readable.fromWeb(body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: 'Object not found' });
      return;
    }
    console.error('Error serving object:', error);
    res.status(500).json({ error: 'Failed to serve object' });
  }
});

export default router;

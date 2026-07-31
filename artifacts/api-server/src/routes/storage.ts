import { Readable } from "stream";
import { RequestUploadUrlBody, RequestUploadUrlResponse } from "@workspace/api-zod";
import { Router, type IRouter, type Request, type Response } from "express";
import { ObjectNotFoundError, ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

/**
 * POST /storage/uploads/request-url
 * Request a presigned URL for file upload. Requires an active session.
 */
router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid required fields" });
    return;
  }

  try {
    const { name, size, contentType } = parsed.data;
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

    res.json(
      RequestUploadUrlResponse.parse({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      }),
    );
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

/**
 * GET /storage/public-objects/*
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS. No auth required.
 */
router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const file = await objectStorageService.searchPublicObject(filePath);

    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const response = await objectStorageService.downloadObject(file);
    res.setHeader("Content-Type", response.headers.get("Content-Type") ?? "application/octet-stream");

    const cacheControl = response.headers.get("Cache-Control");
    if (cacheControl) res.setHeader("Cache-Control", cacheControl);

    const body = response.body;
    if (!body) {
      res.status(500).json({ error: "Empty response body" });
      return;
    }

    Readable.fromWeb(body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
  } catch (error) {
    console.error("Error serving public object:", error);
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

/**
 * GET /storage/objects/:objectPath
 * Serve uploaded object entities. Requires session auth.
 */
router.get("/storage/objects/*objectPath", async (req: Request, res: Response) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const raw = req.params.objectPath;
    const objectPath = Array.isArray(raw) ? raw.join("/") : raw;

    const file = await objectStorageService.getObjectEntityFile(`/objects/${objectPath}`);
    const response = await objectStorageService.downloadObject(file, 3600);

    res.setHeader("Content-Type", response.headers.get("Content-Type") ?? "application/octet-stream");
    const cacheControl = response.headers.get("Cache-Control");
    if (cacheControl) res.setHeader("Cache-Control", cacheControl);

    const body = response.body;
    if (!body) {
      res.status(500).json({ error: "Empty response body" });
      return;
    }

    Readable.fromWeb(body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    console.error("Error serving object:", error);
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;

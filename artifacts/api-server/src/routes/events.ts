/**
 * GET /api/events — Server-Sent Events endpoint.
 * Authenticated clients connect here to receive real-time pushes.
 */
import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { sseManager } from "../lib/sse";

const router = Router();

router.get("/events", requireAuth, (req, res) => {
  const userId = req.session.userId!;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering if present
  res.flushHeaders();

  // Send an initial ping so the client knows the connection is live
  res.write(`data: ${JSON.stringify({ type: "ping", payload: null })}\n\n`);

  const cleanup = sseManager.add(userId, res);

  // Keep-alive ping every 25 s to prevent proxy timeouts
  const keepAlive = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: "ping", payload: null })}\n\n`);
    } catch {
      clearInterval(keepAlive);
    }
  }, 25_000);

  req.on("close", () => {
    clearInterval(keepAlive);
    cleanup();
  });
});

export default router;

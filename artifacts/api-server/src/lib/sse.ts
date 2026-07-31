/**
 * Server-Sent Events manager.
 * Routes push events to authenticated clients subscribed on GET /api/events.
 */
import { Response } from "express";

export type SseEventType =
  | "notification"
  | "offer_updated"
  | "listing_updated"
  | "message_sent"
  | "verification_updated"
  | "ping";

export interface SseEvent {
  type: SseEventType;
  payload: unknown;
}

interface SseClient {
  userId: number;
  res: Response;
}

class SseManager {
  private clients: Set<SseClient> = new Set();

  /** Register a new SSE connection for a user. Returns a cleanup function. */
  add(userId: number, res: Response): () => void {
    const client: SseClient = { userId, res };
    this.clients.add(client);
    return () => this.clients.delete(client);
  }

  /** Push an event to one specific user (all their open tabs). */
  sendToUser(userId: number, event: SseEvent): void {
    const data = JSON.stringify(event);
    for (const client of this.clients) {
      if (client.userId === userId) {
        try {
          client.res.write(`data: ${data}\n\n`);
        } catch {
          this.clients.delete(client);
        }
      }
    }
  }

  /** Push an event to a set of user IDs. */
  sendToUsers(userIds: number[], event: SseEvent): void {
    for (const userId of userIds) {
      this.sendToUser(userId, event);
    }
  }

  /** Number of currently connected clients. */
  get size(): number {
    return this.clients.size;
  }
}

export const sseManager = new SseManager();

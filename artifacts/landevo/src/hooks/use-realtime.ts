/**
 * useRealtime — connects to GET /api/events (SSE) and invalidates React Query
 * caches whenever the server pushes an event.
 *
 * Mount once in the app layout so all pages benefit automatically.
 */
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListNotificationsQueryKey,
  getListMyOffersQueryKey,
  getListListingsQueryKey,
  getListThreadsQueryKey,
  getGetMeQueryKey,
} from "@workspace/api-client-react";

type SseEventType =
  | "notification"
  | "offer_updated"
  | "listing_updated"
  | "message_sent"
  | "verification_updated"
  | "ping";

interface SseEvent {
  type: SseEventType;
  payload: unknown;
}

export function useRealtime() {
  const qc = useQueryClient();
  const esRef = useRef<EventSource | null>(null);
  const retryDelay = useRef(1000);

  useEffect(() => {
    let destroyed = false;

    function connect() {
      if (destroyed) return;

      const es = new EventSource("/api/events", { withCredentials: true });
      esRef.current = es;

      es.onopen = () => {
        retryDelay.current = 1000; // reset backoff on success
      };

      es.onmessage = (e: MessageEvent) => {
        let event: SseEvent;
        try {
          event = JSON.parse(e.data as string) as SseEvent;
        } catch {
          return;
        }

        switch (event.type) {
          case "notification":
            qc.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
            break;
          case "offer_updated":
            qc.invalidateQueries({ queryKey: getListMyOffersQueryKey() });
            break;
          case "listing_updated":
            qc.invalidateQueries({ queryKey: getListListingsQueryKey() });
            break;
          case "message_sent":
            qc.invalidateQueries({ queryKey: getListThreadsQueryKey() });
            // payload carries threadId — the message page will re-fetch its own thread
            if (event.payload && typeof event.payload === "object" && "threadId" in event.payload) {
              qc.invalidateQueries({
                predicate: (q) =>
                  Array.isArray(q.queryKey) &&
                  q.queryKey.some(
                    (k) =>
                      typeof k === "string" &&
                      k.includes(`/threads/${(event.payload as { threadId: number }).threadId}/messages`),
                  ),
              });
            }
            break;
          case "verification_updated":
            qc.invalidateQueries({ queryKey: getListListingsQueryKey() });
            qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
            break;
          case "ping":
          default:
            break;
        }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        if (!destroyed) {
          setTimeout(connect, retryDelay.current);
          retryDelay.current = Math.min(retryDelay.current * 2, 30_000);
        }
      };
    }

    connect();

    return () => {
      destroyed = true;
      esRef.current?.close();
      esRef.current = null;
    };
  }, [qc]);
}

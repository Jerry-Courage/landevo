import { db, activityLogsTable } from "@workspace/db";

export interface LogActivityParams {
  actorId?: number | null;
  actorName?: string;
  actorRole?: string;
  action: string;
  targetType: string;
  targetLabel: string;
  kind: string;
  note?: string | null;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await db.insert(activityLogsTable).values({
      actorId: params.actorId ?? null,
      actorName: params.actorName ?? "System",
      actorRole: params.actorRole ?? "Automated",
      action: params.action,
      targetType: params.targetType,
      targetLabel: params.targetLabel,
      kind: params.kind,
      note: params.note ?? null,
    });
  } catch (err) {
    // Never let logging crash a request
    console.error("logActivity failed:", err);
  }
}

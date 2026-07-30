import { Request, Response, NextFunction } from "express";

export type UserRole = "agent" | "buyer" | "commission_admin" | "system_admin";

/** Reject if not authenticated. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

/** Reject if authenticated user does not have one of the required roles. */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!req.session.userRole || !roles.includes(req.session.userRole as UserRole)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

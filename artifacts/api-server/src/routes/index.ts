import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import listingsRouter from "./listings";
import offersRouter from "./offers";
import verificationsRouter from "./verifications";
import transactionsRouter from "./transactions";
import messagesRouter from "./messages";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import commissionRouter from "./commission";
import storageRouter from "./storage";
import eventsRouter from "./events";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/listings", listingsRouter);
router.use("/", offersRouter);               // /listings/:id/offers and /offers
router.use("/verifications", verificationsRouter);
router.use("/transactions", transactionsRouter);
router.use("/", messagesRouter);             // /threads and /threads/:id/messages
router.use("/notifications", notificationsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/admin", adminRouter);
router.use("/commission", commissionRouter);
router.use("/users", usersRouter);
router.use("/", storageRouter);              // /storage/uploads/request-url, /storage/objects/*, /storage/public-objects/*
router.use("/", eventsRouter);               // /events (SSE)

export default router;

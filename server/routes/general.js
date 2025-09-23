import express from "express";
import { getUser } from "../controllers/general.js";
import { getDashboardStats } from "../controllers/dashboard_new.js";
import { updateUserProfile } from "../controllers/settings.js";

const router = express.Router();

router.get("/user/:id", getUser);
router.patch("/user/:userId", updateUserProfile);
router.get("/dashboard-stats", getDashboardStats);

export default router;

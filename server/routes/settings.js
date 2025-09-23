import express from "express";
import { updateUserProfile, changePassword } from "../controllers/settings.js";

const router = express.Router();

router.patch("/user/:userId", updateUserProfile);
router.post("/change-password", changePassword);

export default router;
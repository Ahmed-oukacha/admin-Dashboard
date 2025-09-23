import express from "express";
import { getUsersStatus } from "../controllers/debug.js";
import { activateAllOldUsers } from "../controllers/maintenance.js";

const router = express.Router();

// @route   GET /debug/users
// @desc    فحص حالة المستخدمين
// @access  Public (للاختبار فقط)
router.get("/users", getUsersStatus);

// @route   POST /debug/activate-all
// @desc    تفعيل جميع الحسابات القديمة
// @access  Public (للصيانة فقط)
router.post("/activate-all", activateAllOldUsers);

export default router;
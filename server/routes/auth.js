import express from "express";
import { loginAdmin, registerAdmin, verifyToken, logoutAdmin, activateAccount } from "../controllers/auth.js";

const router = express.Router();

// @route   POST /auth/register
// @desc    Inscription administrateur
// @access  Public
router.post("/register", registerAdmin);

// @route   POST /auth/login
// @desc    Connexion administrateur
// @access  Public
router.post("/login", loginAdmin);

// @route   POST /auth/verify-token
// @desc    Vérifier le token JWT
// @access  Private
router.post("/verify-token", verifyToken);

// @route   POST /auth/logout
// @desc    Déconnexion administrateur
// @access  Private
router.post("/logout", logoutAdmin);

// @route   GET /auth/activate/:token
// @desc    Activer un compte administrateur
// @access  Public
router.get("/activate/:token", activateAccount);

export default router;

import express from "express";
import { loginAdmin, registerAdmin, verifyToken, logoutAdmin, activateUser } from "../controllers/auth.js";
import { changePassword } from "../controllers/settings.js";

const router = express.Router();

// @route   POST /auth/register
// @desc    Inscription administrateur
// @access  Public
router.post("/register", registerAdmin);

// @route   POST /auth/login
// @desc    Connexion administrateur
// @access  Public
router.post("/login", loginAdmin);

// @route   GET /auth/activate/:token
// @desc    Activation du compte utilisateur
// @access  Public
router.get("/activate/:token", activateUser);

// @route   GET /auth/verify
// @desc    Vérifier le token JWT
// @access  Private
router.get("/verify", verifyToken);

// @route   POST /auth/logout
// @desc    Déconnexion administrateur
// @access  Private
router.post("/logout", logoutAdmin);

// @route   PATCH /auth/change-password
// @desc    Changer le mot de passe
// @access  Private
router.patch("/change-password", changePassword);

export default router;
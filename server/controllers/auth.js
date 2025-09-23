import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser.js";
import crypto from "crypto";
import { sendActivationEmailToAdmin, sendConfirmationToUser } from "../services/emailService.js";

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token valide 7 jours
  });
};

// @desc    Connexion administrateur
// @route   POST /auth/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs requis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir une adresse e-mail et un mot de passe"
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await AdminUser.findOne({ email }).select("+password");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides"
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Votre compte a été désactivé. Contactez l'administrateur."
      });
    }

    // Vérifier si le compte est activé
    if (!user.isActivated) {
      return res.status(401).json({
        success: false,
        message: "Votre compte n'est pas encore activé. Veuillez attendre l'activation par l'administrateur."
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides"
      });
    }

    // Mettre à jour la date de dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Générer le token
    const token = generateToken(user._id);

    // Réponse de succès
    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur"
    });
  }
};

// @desc    تسجيل مستخدم جديد
// @route   POST /auth/register
// @access  Public
export const registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = "admin" } = req.body;

    // Validation des champs requis
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir tous les champs requis (prénom, nom, email, mot de passe)"
      });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format d'email invalide"
      });
    }

    // Validation du mot de passe (minimum 6 caractères)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Le mot de passe doit contenir au moins 6 caractères"
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await AdminUser.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Un utilisateur avec cet email existe déjà"
      });
    }

    // إنشاء token للتفعيل
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ساعة

    // Créer un nouveau utilisateur (غير مفعل)
    const user = await AdminUser.create({
      firstName,
      lastName,
      email,
      password, // Le modèle se charge du hashage automatiquement
      role,
      isActive: false, // غير مفعل بعد
      isActivated: false, // ينتظر التفعيل
      activationToken,
      activationTokenExpires
    });

    // إرسال إيميل للأدمين للتفعيل
    const emailSent = await sendActivationEmailToAdmin(
      email, 
      `${firstName} ${lastName}`, 
      activationToken
    );

    // إرسال إيميل تأكيد للمستخدم
    await sendConfirmationToUser(email, `${firstName} ${lastName}`);

    res.status(201).json({
      success: true,
      message: "Demande d'inscription envoyée avec succès. En attente d'activation par l'administrateur.",
      data: {
        message: "Vous recevrez une notification d'activation lors de l'approbation de votre demande",
        email: user.email,
        emailSent
      }
    });

  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    
    // Gestion des erreurs de validation MongoDB
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur"
    });
  }
};

// @desc    Vérifier le token JWT
// @route   GET /auth/verify
// @access  Private
export const verifyToken = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Aucun token fourni"
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Trouver l'utilisateur
    const user = await AdminUser.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Token invalide"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    res.status(401).json({
      success: false,
      message: "Token invalide"
    });
  }
};

// @desc    Déconnexion (optionnel - côté client principalement)
// @route   POST /auth/logout
// @access  Private
export const logoutAdmin = async (req, res) => {
  try {
    // Note: Avec JWT, la déconnexion se fait principalement côté client
    // en supprimant le token. Ici on peut juste confirmer la déconnexion.
    
    res.status(200).json({
      success: true,
      message: "Déconnexion réussie"
    });

  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur"
    });
  }
};

// @desc    تفعيل المستخدم
// @route   GET /auth/activate/:token
// @access  Public
export const activateUser = async (req, res) => {
  try {
    const { token } = req.params;

    // البحث عن المستخدم بالـ token
    const user = await AdminUser.findOne({
      activationToken: token,
      activationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token d'activation invalide ou expiré"
      });
    }

    // تفعيل المستخدم
    user.isActivated = true;
    user.isActive = true;
    user.activationToken = null;
    user.activationTokenExpires = null;
    await user.save();

    // إرسال رد مع صفحة تأكيد بالفرنسية
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activation réussie ✅</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.8s ease-in;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .success-container {
            background: white;
            padding: 50px 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            width: 90%;
            animation: slideUp 0.6s ease-out;
          }
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .success-icon {
            font-size: 80px;
            color: #4CAF50;
            margin-bottom: 20px;
            animation: bounce 1s infinite;
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          h1 {
            color: #2c3e50;
            font-size: 28px;
            margin-bottom: 15px;
            font-weight: bold;
          }
          .user-info {
            background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
            padding: 20px;
            border-radius: 15px;
            margin: 25px 0;
            border: 2px solid #4CAF50;
          }
          .user-info p {
            color: #2d5016;
            font-size: 16px;
            margin: 8px 0;
            font-weight: 500;
          }
          .message {
            color: #555;
            font-size: 18px;
            line-height: 1.6;
            margin: 20px 0;
          }
          .close-btn {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            border: none;
            padding: 15px 40px;
            border-radius: 30px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
          }
          .close-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
          }
          .status {
            background: #e8f5e8;
            color: #2d5016;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            font-weight: bold;
            margin: 10px 0;
            border: 2px solid #4CAF50;
          }
        </style>
      </head>
      <body>
        <div class="success-container">
          <div class="success-icon">✅</div>
          <h1>Activation réussie !</h1>
          
          <div class="status">🎉 Compte activé</div>
          
          <div class="user-info">
            <p><strong>👤 Utilisateur :</strong> ${user.firstName} ${user.lastName}</p>
            <p><strong>📧 Email :</strong> ${user.email}</p>
            <p><strong>⏰ Date d'activation :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>
          
          <p class="message">
            🎊 Félicitations ! Votre compte a été activé avec succès dans le système Asksource Admin Dashboard.<br>
            L'utilisateur peut maintenant se connecter et accéder à toutes les fonctionnalités.
          </p>
          
          <button class="close-btn" onclick="window.close()">
            Fermer la fenêtre
          </button>
          
          <script>
            // Fermeture automatique après 10 secondes
            setTimeout(() => {
              alert('Activation réussie ! La fenêtre va se fermer maintenant.');
              window.close();
            }, 10000);
          </script>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error("Erreur lors de l'activation de l'utilisateur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur système"
    });
  }
};
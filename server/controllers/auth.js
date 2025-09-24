import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import AdminUser from "../models/AdminUser.js";

// --- Send Welcome Email Function ---
async function sendWelcomeEmail({ to, firstName, lastName }) {
  const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Bienvenue ${firstName} ${lastName} !</h2>
      <p>Merci d'avoir créé un compte sur notre plateforme.</p>
      <p>Votre demande a bien été prise en compte. Nous vous remercions pour votre confiance.</p>
      <p><strong>Veuillez patienter pendant que l'administrateur examine et approuve votre inscription.</strong></p>
      <p>Vous recevrez un email dès que votre compte sera activé.</p>
      <br>
      <p>Cordialement,<br>L'équipe d'administration</p>
    </div>
  `;

  try {
    const info = await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Bienvenue sur notre plateforme !',
      html
    });
    console.log('Welcome email sent:', info);
  } catch (err) {
    console.error('Erreur lors de l\'envoi de l\'email de bienvenue (sendMail):', err);
  }
}

export const registerAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName, avatarColor } = req.body;

    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà" });
    }

    const activationToken = jwt.sign(
      { email, firstName, lastName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const user = new AdminUser({
      email,
      password,
      firstName,
      lastName,
      avatarColor: avatarColor || "#4CAF50",
      isActive: false,
      activationToken
    });


    await user.save();

    // Send welcome email to the registering user (in French)
    try {
      await sendWelcomeEmail({
        to: email,
        firstName,
        lastName
      });
    } catch (welcomeError) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', welcomeError);
    }


    // Send email to admin
    try {
      const emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const activationLink = `${process.env.SERVER_URL || 'http://localhost:5001'}/auth/activate/${activationToken}`;

      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: 'Nouvelle demande d activation de compte',
        html: `
          <h2>Nouvelle demande d'activation</h2>
          <p>Un nouvel utilisateur souhaite créer un compte:</p>
          <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><a href="${activationLink}">Cliquez ici pour activer le compte</a></p>
        `
      });

      res.status(201).json({
        message: "Compte créé avec succès! Veuillez attendre l'approbation de l'administrateur.",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarColor: user.avatarColor,
          isActive: user.isActive
        }
      });
    } catch (emailError) {
      res.status(201).json({
        message: "Compte créé avec succès! L'administrateur sera notifié pour l'activation.",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarColor: user.avatarColor,
          isActive: user.isActive
        }
      });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await AdminUser.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        message: "Votre compte n'est pas encore activé. Veuillez attendre l'approbation de l'administrateur." 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarColor: user.avatarColor
      }
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "Token manquant" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AdminUser.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarColor: user.avatarColor
      }
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    res.status(401).json({ message: "Token invalide" });
  }
};

export const activateAccount = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email } = decoded;

    const user = await AdminUser.findOne({ email, activationToken: token });
    if (!user) {
      return res.status(400).send(`
        <html>
          <head><title>Erreur d activation</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h2 style="color: red;">Token d activation invalide</h2>
            <p>Ce lien d activation n est pas valide.</p>
          </body>
        </html>
      `);
    }

    if (user.isActive) {
      return res.status(200).send(`
        <html>
          <head><title>Compte deja active</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h2 style="color: green;">Compte deja active</h2>
            <p>Ce compte est deja active.</p>
          </body>
        </html>
      `);
    }

    user.isActive = true;
    user.activationToken = null;
    await user.save();

    res.status(200).send(`
      <html>
        <head><title>Compte active avec succes</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h2 style="color: green;">Compte active avec succes!</h2>
          <p><strong>Utilisateur:</strong> ${user.firstName} ${user.lastName}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p>L utilisateur peut maintenant se connecter.</p>
        </body>
      </html>
    `);

  } catch (error) {
    console.error("Erreur lors de l activation:", error);
    res.status(400).send(`
      <html>
        <head><title>Erreur d activation</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h2 style="color: red;">Erreur d activation</h2>
          <p>Une erreur s est produite.</p>
        </body>
      </html>
    `);
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Script pour créer un utilisateur administrateur de test
 * À exécuter une seule fois pour initialiser la base de données
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import AdminUser from "./models/AdminUser.js";

// Charger les variables d'environnement
dotenv.config();

const createTestAdmin = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connexion à MongoDB établie");

    // Données de l'administrateur de test
    const adminData = {
      email: "admin@asksource.com",
      password: "admin123456", // Sera hashé automatiquement
      firstName: "Admin",
      lastName: "Asksource",
      role: "superadmin",
      isActive: true
    };

    // Vérifier si l'utilisateur existe déjà
    const existingAdmin = await AdminUser.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log("⚠️  Un administrateur avec cet email existe déjà");
      return;
    }

    // Créer l'administrateur
    const admin = new AdminUser(adminData);
    await admin.save();

    console.log("✅ Administrateur créé avec succès !");
    console.log("📧 Email: admin@asksource.com");
    console.log("🔑 Mot de passe: admin123456");
    console.log("👤 Rôle: Super Administrateur");

  } catch (error) {
    console.error("❌ Erreur lors de la création de l'administrateur:", error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log("🔌 Connexion fermée");
  }
};

// Exécuter le script
createTestAdmin();
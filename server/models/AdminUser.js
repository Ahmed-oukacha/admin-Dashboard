<<<<<<< HEAD
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "L'adresse e-mail est requise"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Veuillez entrer une adresse e-mail valide"
      ]
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"]
    },
    firstName: {
      type: String,
      required: [true, "Le prénom est requis"],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true
    },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isActivated: {
      type: Boolean,
      default: false
    },
    activationToken: {
      type: String,
      default: null
    },
    activationTokenExpires: {
      type: Date,
      default: null
    },
    lastLogin: {
      type: Date
    },
    avatarColor: {
      type: String,
      default: "#1976d2"
    }
  },
  {
    timestamps: true
  }
);

// Hash du mot de passe avant sauvegarde
AdminUserSchema.pre("save", async function (next) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified("password")) return next();

  try {
    // Générer un salt et hasher le mot de passe
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
AdminUserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour obtenir les informations publiques de l'utilisateur
AdminUserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const AdminUser = mongoose.model("AdminUser", AdminUserSchema);

export default AdminUser;
=======

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AdminUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
});

// Middleware pour hasher le mot de passe avant sauvegarde
AdminUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('AdminUser', AdminUserSchema);
>>>>>>> 6a2cba5a12363e44188d8128acc6aea9967c95e3

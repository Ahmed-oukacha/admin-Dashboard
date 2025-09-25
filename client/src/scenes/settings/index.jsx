import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  PersonOutlined,
  LockOutlined,
  ColorLensOutlined,
  EditOutlined,
  SaveOutlined,
  CancelOutlined,
} from "@mui/icons-material";
import Header from "components/Header";
import UserAvatar from "components/UserAvatar";
import { updateUser } from "state/authSlice";
import axios from "axios";

const Settings = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const user = authState?.user || null;
  
  // Debug: التحقق من بيانات المستخدم
  console.log("Settings - authState:", authState);
  console.log("Settings - user from authState:", user);
  console.log("Settings - user ID:", user?._id);
  
  // États pour les informations du profil
  const [profileData, setProfileData] = useState({
    name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
    email: user?.email || "",
  });
  
  // États pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // États pour la personnalisation de l'avatar
  const [avatarData, setAvatarData] = useState({
    color: user?.avatarColor || theme.palette.primary.main,
    initials: user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "",
  });
  
  // États pour l'interface
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("profile");
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  
  // Couleurs prédéfinies pour l'avatar
  const avatarColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
    "#FECA57", "#FF9FF3", "#54A0FF", "#5F27CD",
    "#00D2D3", "#FF9F43", "#10AC84", "#EE5A24"
  ];

  // Mettre à jour les initiales quand le nom change
  useEffect(() => {
    if (profileData.name) {
      const initials = profileData.name.split(' ').map(n => n[0]).join('').toUpperCase();
      setAvatarData(prev => ({ ...prev, initials }));
    }
  }, [profileData.name]);

  // Mettre à jour profileData quand user change
  useEffect(() => {
    if (user) {
      setProfileData({
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
      });
      setAvatarData(prev => ({
        ...prev,
        initials: `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase(),
      }));
    }
  }, [user]);
  
  // Debug: التحقق من بيانات المستخدم
  console.log("Settings - authState:", authState);
  console.log("Settings - user from authState:", user);
  console.log("Settings - user ID:", user?._id);
  console.log("Settings - user structure:", user ? Object.keys(user) : "No user");
  console.log("Settings - user id (without underscore):", user?.id);
  
  // التحقق من وجود المستخدم
  const userId = user?._id || user?.id;
  
  if (!authState.isAuthenticated || !user || !userId) {
    return (
      <Box m="1.5rem 2.5rem">
        <Header title="Paramètres" subtitle="Gérer vos préférences et informations personnelles" />
        <Alert severity="warning">
          Aucun utilisateur connecté. Veuillez vous reconnecter.
        </Alert>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Debug info:
          <br />- isAuthenticated: {authState.isAuthenticated ? "true" : "false"}
          <br />- User present: {user ? "true" : "false"}
          <br />- User ID (_id): {user?._id || "N/A"}
          <br />- User ID (id): {user?.id || "N/A"}
          <br />- User keys: {user ? Object.keys(user).join(", ") : "None"}
          <br />- Full user: {user ? JSON.stringify(user).substring(0, 200) + "..." : "None"}
        </Typography>
      </Box>
    );
  }

  // Fonction pour mettre à jour le profil
  const handleProfileUpdate = async () => {
    const userId = user?._id || user?.id;
    
    if (!user || !userId) {
      setError("Utilisateur non identifié. Veuillez vous reconnecter.");
      return;
    }

    if (!profileData.name.trim() || !profileData.email.trim()) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      console.log("Sending profile update:", {
        name: profileData.name,
        email: profileData.email,
        userId: userId
      });
      
      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/settings/user/${userId}`,
        {
          name: profileData.name,
          email: profileData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Profile update response:", response.data);
      
      // تحديث Redux state مع البيانات الجديدة
      const nameParts = profileData.name.trim().split(' ');
      dispatch(updateUser({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: profileData.email,
        avatarColor: avatarData.color
      }));
      
      setSuccess("Profil mis à jour avec succès!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour changer le mot de passe
  const handlePasswordChange = async () => {
    const userId = user?._id || user?.id;
    
    if (!user || !userId) {
      setError("Utilisateur non identifié. Veuillez vous reconnecter.");
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError("Tous les champs du mot de passe sont obligatoires");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      console.log("Sending password change for user:", userId);
      
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/settings/change-password`,
        {
          userId: userId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Password change response:", response.data);
      setSuccess("Mot de passe mis à jour avec succès!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Password change error:", err);
      setError(err.response?.data?.message || "Erreur lors du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour l'avatar
  const handleAvatarUpdate = async () => {
    const userId = user?._id || user?.id;
    
    if (!user || !userId) {
      setError("Utilisateur non identifié. Veuillez vous reconnecter.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/settings/user/${userId}`,
        {
          avatarColor: avatarData.color,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // تحديث Redux state مع اللون الجديد
      dispatch(updateUser({
        avatarColor: avatarData.color
      }));

      setSuccess("Couleur de l'avatar mise à jour!");
      setAvatarDialogOpen(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour de l'avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="Paramètres" subtitle="Gérer vos préférences et informations personnelles" />
      
      {/* Messages de statut */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Section Profil */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader
              avatar={<PersonOutlined />}
              title="Informations du Profil"
              titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
            />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={3}>
                {/* Avatar actuel */}
                <Box display="flex" alignItems="center" gap={2}>
                  <UserAvatar 
                    name={profileData.name || user?.name} 
                    size={64}
                    color={avatarData.color}
                  />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Avatar actuel
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ColorLensOutlined />}
                      onClick={() => setAvatarDialogOpen(true)}
                    >
                      Personnaliser
                    </Button>
                  </Box>
                </Box>

                <TextField
                  label="Nom complet"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  fullWidth
                  variant="outlined"
                />
                
                <TextField
                  label="Adresse e-mail"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  fullWidth
                  variant="outlined"
                />
                
                <Button
                  variant="contained"
                  startIcon={<SaveOutlined />}
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  fullWidth
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={20} /> : "Mettre à jour le profil"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Section Mot de passe */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader
              avatar={<LockOutlined />}
              title="Changer le Mot de Passe"
              titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
            />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={3}>
                <TextField
                  label="Mot de passe actuel"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  fullWidth
                  variant="outlined"
                />
                
                <TextField
                  label="Nouveau mot de passe"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  fullWidth
                  variant="outlined"
                />
                
                <TextField
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  fullWidth
                  variant="outlined"
                />
                
                <Button
                  variant="contained"
                  startIcon={<LockOutlined />}
                  onClick={handlePasswordChange}
                  disabled={loading}
                  fullWidth
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.dark,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={20} /> : "Changer le mot de passe"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog pour personnaliser l'avatar */}
      <Dialog 
        open={avatarDialogOpen} 
        onClose={() => setAvatarDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        disablePortal
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <ColorLensOutlined />
            Personnaliser votre Avatar
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            {/* Aperçu */}
            <Box display="flex" justifyContent="center">
              <UserAvatar 
                name={profileData.name || user?.name} 
                size={80}
                color={avatarData.color}
              />
            </Box>
            
            {/* Sélecteur de couleurs */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Choisir une couleur:
              </Typography>
              <Grid container spacing={1}>
                {avatarColors.map((color, index) => (
                  <Grid item key={index}>
                    <IconButton
                      onClick={() => setAvatarData({ ...avatarData, color })}
                      sx={{
                        backgroundColor: color,
                        width: 40,
                        height: 40,
                        border: avatarData.color === color ? '3px solid #000' : '2px solid #ccc',
                        '&:hover': {
                          backgroundColor: color,
                          opacity: 0.8,
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialogOpen(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAvatarUpdate}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Sauvegarder"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
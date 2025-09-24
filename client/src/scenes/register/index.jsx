import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Avatar,
  Link,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { PersonAddOutlined } from "@mui/icons-material";
import { registerUser, clearRegistrationMessage } from "state/authSlice";

const Register = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { registrationMessage, isLoading: authLoading } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Nettoyer le message d'inscription quand on quitte le composant
  useEffect(() => {
    return () => {
      dispatch(clearRegistrationMessage());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation côté client
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format.");
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await dispatch(registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      }));

      if (registerUser.fulfilled.match(result)) {
        // Inscription réussie - Ne PAS rediriger vers le dashboard
        // Le message sera affiché depuis registrationMessage dans Redux
        setError("");
        // Réinitialiser le formulaire
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        // Rediriger vers la page de connexion après 5 secondes pour lire le message
        setTimeout(() => {
          navigate("/");
        }, 5000);
      } else {
        // Inscription échouée
        setError(result.payload || "Registration failed");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            width: "100%",
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Avatar
              sx={{
                m: 1,
                bgcolor: theme.palette.primary.main,
                width: 56,
                height: 56,
              }}
            >
              <PersonAddOutlined sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: theme.palette.primary.main,
                textAlign: "center",
                mb: 1,
              }}
            >
              Inscription
            </Typography>
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ textAlign: "center" }}
            >
              Créez votre compte Asksource Admin
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {registrationMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {registrationMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="Prénom"
                autoFocus
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.background.alt,
                  },
                }}
              />
              <TextField
                name="lastName"
                required
                fullWidth
                id="lastName"
                label="Nom"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.background.alt,
                  },
                }}
              />
            </Box>

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse Email"
              name="email"
              autoComplete="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: theme.palette.background.alt,
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de Passe"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: theme.palette.background.alt,
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmer le Mot de Passe"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: theme.palette.background.alt,
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || authLoading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: "bold",
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                "&:hover": {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
              }}
            >
              {isLoading || authLoading ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} color="inherit" />
                  Inscription en cours...
                </Box>
              ) : (
                "S'inscrire"
              )}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Vous avez déjà un compte ?{" "}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate("/login")}
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: "bold",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Se connecter
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
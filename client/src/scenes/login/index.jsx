<<<<<<< HEAD
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
=======
import React, { useState } from 'react';
>>>>>>> 6a2cba5a12363e44188d8128acc6aea9967c95e3
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
<<<<<<< HEAD
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Link,
} from "@mui/material";
import {
  LoginOutlined,
  EmailOutlined,
  LockOutlined,
} from "@mui/icons-material";
import { loginUser } from "state/authSlice";
=======
  Container,
  Alert,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from 'state/api';
import { loginSuccess } from 'state';
>>>>>>> 6a2cba5a12363e44188d8128acc6aea9967c95e3

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
<<<<<<< HEAD
  const isNonMobile = useMediaQuery("(min-width: 600px)");

  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "L'adresse e-mail est requise";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse e-mail valide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
=======
  const [login, { isLoading }] = useLoginMutation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Effacer l'erreur quand l'utilisateur tape
    if (error) setError('');
>>>>>>> 6a2cba5a12363e44188d8128acc6aea9967c95e3
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(loginUser(formData));
      
      if (loginUser.fulfilled.match(result)) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
=======
    setError('');

    console.log('بيانات النموذج:', formData);

    try {
      console.log('محاولة إرسال طلب تسجيل الدخول...');
      const result = await login(formData).unwrap();
      
      console.log('نتيجة تسجيل الدخول:', result);
      
      // Stocker les données d'authentification dans Redux
      dispatch(loginSuccess({
        token: result.token,
        user: result.user
      }));
      
      console.log('تم تسجيل الدخول بنجاح، التوجه إلى لوحة التحكم...');
      // Rediriger vers le tableau de bord
      navigate('/dashboard');
    } catch (err) {
      console.error('خطأ في تسجيل الدخول:', err);
      // Afficher le message d'erreur du serveur ou un message par défaut
      setError(err?.data?.message || 'Erreur de connexion. Veuillez réessayer.');
>>>>>>> 6a2cba5a12363e44188d8128acc6aea9967c95e3
    }
  };

  return (
<<<<<<< HEAD
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        padding: "1rem",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: isNonMobile ? "3rem" : "2rem",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "400px",
          backgroundColor: theme.palette.background.alt,
        }}
      >
        {/* Logo/Titre */}
        <Box textAlign="center" mb={3}>
          <Typography
            variant="h3"
            fontWeight="bold"
            color={theme.palette.primary.main}
            mb={1}
          >
            ASKSOURCE
          </Typography>
          <Typography
            variant="h6"
            color={theme.palette.secondary[100]}
            mb={3}
          >
            Tableau de bord administrateur
          </Typography>
        </Box>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            
            {/* Affichage des erreurs globales */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Champ E-mail */}
            <Box position="relative">
              <TextField
                fullWidth
                type="email"
                name="email"
                label="Adresse e-mail"
                placeholder="admin@asksource.com"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <EmailOutlined 
                      sx={{ 
                        color: theme.palette.secondary[300], 
                        mr: 1 
                      }} 
                    />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.background.default,
                  },
                }}
              />
            </Box>

            {/* Champ Mot de passe */}
            <Box position="relative">
              <TextField
                fullWidth
                type="password"
                name="password"
                label="Mot de passe"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <LockOutlined 
                      sx={{ 
                        color: theme.palette.secondary[300], 
                        mr: 1 
                      }} 
                    />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.background.default,
                  },
                }}
              />
            </Box>

            {/* Bouton de connexion */}
=======
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            color={theme.palette.secondary[100]}
            sx={{ mb: 3 }}
          >
            Connexion Administrateur
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse e-mail"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
>>>>>>> 6a2cba5a12363e44188d8128acc6aea9967c95e3
            <Button
              type="submit"
              fullWidth
              variant="contained"
<<<<<<< HEAD
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <LoginOutlined />
                )
              }
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.alt,
                fontSize: "16px",
                fontWeight: "bold",
                padding: "12px 24px",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
                "&:disabled": {
                  backgroundColor: theme.palette.secondary[300],
                },
              }}
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </Box>
        </form>

        {/* Note de bas de page */}
        <Box textAlign="center" mt={3}>
          <Typography
            variant="body2"
            color={theme.palette.secondary[300]}
            sx={{ mb: 2 }}
          >
            Pas encore de compte ?{" "}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/register")}
              sx={{
                color: theme.palette.primary.main,
                textDecoration: "none",
                fontWeight: "bold",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              S'inscrire ici
            </Link>
          </Typography>
          <Typography
            variant="body2"
            color={theme.palette.secondary[300]}
          >
            Système de gestion RAG - Asksource
          </Typography>
        </Box>
      </Paper>
    </Box>
=======
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: theme.palette.secondary[300],
                '&:hover': {
                  backgroundColor: theme.palette.secondary[400]
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
>>>>>>> 6a2cba5a12363e44188d8128acc6aea9967c95e3
  );
};

export default LoginPage;
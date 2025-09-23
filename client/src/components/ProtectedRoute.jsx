import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { initializeAuth, verifyToken } from "state/authSlice";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  
  const { 
    isAuthenticated, 
    isLoading, 
    isInitialized,
    isVerifying,
    token 
  } = useSelector((state) => state.auth);

  useEffect(() => {
    // Initialiser l'authentification depuis localStorage
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    // Vérifier le token si l'utilisateur semble être connecté
    if (isInitialized && token && !isAuthenticated && !isLoading && !isVerifying) {
      dispatch(verifyToken());
    }
  }, [dispatch, isInitialized, token, isAuthenticated, isLoading, isVerifying]);

  // Affichage de chargement pendant l'initialisation ou vérification
  if (!isInitialized || isLoading || isVerifying) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={50} />
        <Typography variant="h6" color="textSecondary">
          Vérification de l'authentification...
        </Typography>
      </Box>
    );
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Afficher le contenu protégé si authentifié
  return children;
};

export default ProtectedRoute;
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.global.isAuthenticated);
  const token = useSelector((state) => state.global.token);
  const location = useLocation();

  // Vérifier si l'utilisateur est authentifié
  const isUserAuthenticated = isAuthenticated && token;

  if (!isUserAuthenticated) {
    // Rediriger vers la page de connexion avec l'URL de retour
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
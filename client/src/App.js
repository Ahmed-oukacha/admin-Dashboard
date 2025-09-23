import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { themeSettings } from "theme";
<<<<<<< HEAD
import { SearchProvider } from "contexts/SearchContext";
import Layout from "scenes/layout";
import Dashboard from "scenes/dashboard";
import Projects from "scenes/projects";
import Files from "scenes/files";
import Settings from "scenes/settings";
import LoginPage from "scenes/login";
import RegisterPage from "scenes/register";
=======
import { checkAuth } from "state";
import Layout from "scenes/layout";
import Dashboard from "scenes/dashboard";
import Products from "scenes/products";
import Customers from "scenes/customers";
import Transactions from "scenes/transactions";
import Geography from "scenes/geography";
import Overview from "scenes/overview";
import Daily from "scenes/daily";
import Monthly from "scenes/monthly";
import Breakdown from "scenes/breakdown";
import Admin from "scenes/admin";
import Performance from "scenes/performance";
import LoginPage from "scenes/login";
>>>>>>> 6a2cba5a12363e44188d8128acc6aea9967c95e3
import ProtectedRoute from "components/ProtectedRoute";

function App() {
  const mode = useSelector((state) => state.global.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const dispatch = useDispatch();

  // Vérifier l'authentification au chargement de l'app
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
<<<<<<< HEAD
          <SearchProvider>
            <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Routes protégées */}
            <Route 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
=======
          <Routes>
            {/* Route publique pour la connexion */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Routes protégées */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
>>>>>>> 6a2cba5a12363e44188d8128acc6aea9967c95e3
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/files" element={<Files />} />
              <Route path="/files/:projectId" element={<Files />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
          </SearchProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

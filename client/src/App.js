import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { themeSettings } from "theme";
import { SearchProvider } from "contexts/SearchContext";
import { initializeAuth } from "state/authSlice";
import Layout from "scenes/layout";
import Dashboard from "scenes/dashboard";
import Projects from "scenes/projects";
import Files from "scenes/files";
import Settings from "scenes/settings";
import LoginPage from "scenes/login";
import RegisterPage from "scenes/register";
import AddUserPage from "scenes/adduser";
import ActivationPage from "scenes/activation";
import ProtectedRoute from "components/ProtectedRoute";

function App() {
  const mode = useSelector((state) => state.global.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const dispatch = useDispatch();

  // تهيئة الـ authentication عند بدء التطبيق
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SearchProvider>
            <Routes>
              {/* Routes publiques */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/activate/:token" element={<ActivationPage />} />
              
              {/* Routes protégées */}
              <Route 
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/files" element={<Files />} />
                <Route path="/files/:projectId" element={<Files />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/add-user" element={<AddUserPage />} />
              </Route>
            </Routes>
          </SearchProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
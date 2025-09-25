import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Container,
  useTheme,
} from "@mui/material";
import {
  CheckCircleOutlined,
  ErrorOutlined,
} from "@mui/icons-material";

const ActivationPage = () => {
  const theme = useTheme();
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const activateAccount = async () => {
      try {
        // const response = await fetch(`http://localhost:5001/auth/activate/${token}`, {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/activate/${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Account activated successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "Activation failed. Please try again.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Network error. Please check your connection and try again.");
      }
    };

    if (token) {
      activateAccount();
    } else {
      setStatus("error");
      setMessage("Invalid activation link.");
    }
  }, [token]);

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: theme.palette.background.alt,
            borderRadius: "0.75rem",
            width: "100%",
            maxWidth: "500px",
            textAlign: "center",
          }}
        >
          {status === "loading" && (
            <>
              <CircularProgress
                size={60}
                sx={{ color: theme.palette.primary.main, mb: 3 }}
              />
              <Typography variant="h5" sx={{ mb: 2, color: theme.palette.secondary[100] }}>
                Activating Your Account...
              </Typography>
              <Typography variant="body1" color={theme.palette.secondary[300]}>
                Please wait while we activate your account.
              </Typography>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircleOutlined
                sx={{
                  fontSize: "4rem",
                  color: theme.palette.success.main,
                  marginBottom: 2,
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: theme.palette.secondary[100],
                  marginBottom: 2,
                }}
              >
                Account Activated!
              </Typography>
              <Alert
                severity="success"
                sx={{
                  width: "100%",
                  marginBottom: 3,
                }}
              >
                {message}
              </Alert>
              <Typography variant="body1" sx={{ mb: 3, color: theme.palette.secondary[300] }}>
                Your account has been successfully activated. You can now sign in to access the admin dashboard.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGoToLogin}
                sx={{
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  backgroundColor: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Go to Sign In
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <ErrorOutlined
                sx={{
                  fontSize: "4rem",
                  color: theme.palette.error.main,
                  marginBottom: 2,
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: theme.palette.secondary[100],
                  marginBottom: 2,
                }}
              >
                Activation Failed
              </Typography>
              <Alert
                severity="error"
                sx={{
                  width: "100%",
                  marginBottom: 3,
                }}
              >
                {message}
              </Alert>
              <Typography variant="body1" sx={{ mb: 3, color: theme.palette.secondary[300] }}>
                The activation link may have expired or is invalid. Please contact support or try registering again.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/register")}
                  sx={{
                    py: 1.5,
                    fontSize: "1rem",
                    color: theme.palette.secondary[300],
                    borderColor: theme.palette.secondary[300],
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  Register Again
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleGoToLogin}
                  sx={{
                    py: 1.5,
                    fontSize: "1rem",
                    backgroundColor: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  Go to Login
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ActivationPage;
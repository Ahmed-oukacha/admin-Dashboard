import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Link,
  Container,
} from "@mui/material";
import {
  LoginOutlined,
  EmailOutlined,
  LockOutlined,
} from "@mui/icons-material";
import { loginUser } from "state/authSlice";

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isNonMobile = useMediaQuery("(min-width: 600px)");

  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser(formData));
      if (result.type === "auth/loginUser/fulfilled") {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
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
            maxWidth: "400px",
          }}
        >
          <LoginOutlined
            sx={{
              fontSize: "3rem",
              color: theme.palette.primary.main,
              marginBottom: 2,
            }}
          />

          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: theme.palette.secondary[100],
              marginBottom: 3,
            }}
          >
            Sign In
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                width: "100%",
                marginBottom: 2,
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1, width: "100%" }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-end", mb: 2 }}>
              <EmailOutlined
                sx={{
                  color: theme.palette.secondary[300],
                  mr: 1,
                  my: 0.5,
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-end", mb: 3 }}>
              <LockOutlined
                sx={{
                  color: theme.palette.secondary[300],
                  mr: 1,
                  my: 0.5,
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: "bold",
                backgroundColor: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
                "&:disabled": {
                  backgroundColor: theme.palette.grey[400],
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>

            <Box textAlign="center" mt={2}>
              <Typography variant="body2" color={theme.palette.secondary[300]}>
                Don't have an account?{" "}
                <Link
                  onClick={() => navigate("/register")}
                  variant="body2"
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Create Account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;

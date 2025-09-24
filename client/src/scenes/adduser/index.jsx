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
  Container,
} from "@mui/material";
import {
  PersonAddOutlined,
  EmailOutlined,
  LockOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import { registerUser } from "state/authSlice";
import Header from "components/Header";

const AddUserPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isNonMobile = useMediaQuery("(min-width: 600px)");

  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatarColor: "#4CAF50"
  });

  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    try {
      const result = await dispatch(registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        avatarColor: formData.avatarColor
      }));
      
      if (result.type === "auth/registerUser/fulfilled") {
        navigate("/admin");
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const avatarColors = [
    "#4CAF50", "#2196F3", "#FF9800", "#F44336", 
    "#9C27B0", "#00BCD4", "#795548", "#607D8B"
  ];

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="ADD USER" subtitle="Create a new admin user" />
      
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: theme.palette.background.alt,
            borderRadius: "0.75rem",
            marginTop: 4,
          }}
        >
          <PersonAddOutlined
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
            Add New User
          </Typography>

          {(error || formError) && (
            <Alert
              severity="error"
              sx={{
                width: "100%",
                marginBottom: 2,
              }}
            >
              {formError || error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1, width: "100%" }}
          >
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
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
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
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

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              sx={{
                mb: 2,
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

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              sx={{
                mb: 2,
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

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              variant="outlined"
              sx={{
                mb: 3,
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

            <Typography variant="subtitle1" sx={{ mb: 1, color: theme.palette.secondary[100] }}>
              Avatar Color
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
              {avatarColors.map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: color,
                    borderRadius: "50%",
                    cursor: "pointer",
                    border: formData.avatarColor === color ? `3px solid ${theme.palette.primary.main}` : "2px solid transparent",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s",
                  }}
                  onClick={() => setFormData({ ...formData, avatarColor: color })}
                />
              ))}
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
                "Create User"
              )}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/admin")}
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
              Cancel
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AddUserPage;
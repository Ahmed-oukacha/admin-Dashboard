import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// URL de base de l'API
const API_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5001";

// Async thunk pour la connexion
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Erreur de connexion");
      }

      // Stocker le token dans localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      return data; // Return data directly instead of data.data
    } catch (error) {
      return rejectWithValue("Erreur de connexion réseau");
    }
  }
);

// Async thunk pour l'inscription
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Registering user with data:', userData);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (!response.ok) {
        return rejectWithValue(data.message || "Erreur lors de l'inscription");
      }

      return data; // Return data directly, not data.data
    } catch (error) {
      console.error('Registration network error:', error);
      return rejectWithValue("Erreur de réseau lors de l'inscription");
    }
  }
);

// Async thunk pour vérifier le token
export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        localStorage.removeItem("user");
        return rejectWithValue("Token manquant");
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return rejectWithValue("Token invalide");
      }

      const data = await response.json();
      return { user: data.user, token }; // Return data.user directly
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return rejectWithValue("Erreur de vérification du token");
    }
  }
);

// Async thunk pour la déconnexion
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      
      if (token) {
        // Optionnel : appeler l'endpoint de déconnexion
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      // Nettoyer localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return null;
    } catch (error) {
      // Même en cas d'erreur, on nettoie localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return rejectWithValue("Erreur lors de la déconnexion");
    }
  }
);

// État initial
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
  isVerifying: false,
  registrationMessage: null,
};

// Slice d'authentification
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action pour initialiser l'état depuis localStorage
    initializeAuth: (state) => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      if (token && user) {
        try {
          state.token = token;
          state.user = JSON.parse(user);
          state.isAuthenticated = true;
        } catch (error) {
          // Si erreur de parsing, nettoyer localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      
      state.isInitialized = true;
    },
    
    // Action pour effacer les erreurs
    clearError: (state) => {
      state.error = null;
    },
    
    // Action pour effacer le message d'inscription
    clearRegistrationMessage: (state) => {
      state.registrationMessage = null;
    },
    
    // Action pour réinitialiser l'état
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.registrationMessage = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    
    // Action pour mettre à jour les données utilisateur
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // لا نقوم بتسجيل دخول المستخدم بعد التسجيل
        // المستخدم يحتاج لموافقة المدير أولاً
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
        // نحتفظ بالرسالة في البايلود
        state.registrationMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      
      // Verify Token
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
        state.isVerifying = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isVerifying = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isVerifying = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        // Même en cas d'erreur, on déconnecte l'utilisateur
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      });
  },
});

export const { initializeAuth, clearError, clearRegistrationMessage, resetAuth, updateUser } = authSlice.actions;

export default authSlice.reducer;
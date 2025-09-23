import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "dark",
  userId: "63701cc1f03239b7f700000e",
<<<<<<< HEAD
  user: null,
  token: null,
=======
  // État d'authentification
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token') || null,
  user: null,
>>>>>>> 6a2cba5a12363e44188d8128acc6aea9967c95e3
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
<<<<<<< HEAD
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
=======
    // Actions d'authentification
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
    },
    // Vérifier l'authentification au chargement
    checkAuth: (state) => {
      const token = localStorage.getItem('token');
      if (token) {
        state.isAuthenticated = true;
        state.token = token;
      }
>>>>>>> 6a2cba5a12363e44188d8128acc6aea9967c95e3
    },
  },
});

<<<<<<< HEAD
export const { setMode, setLogin, setLogout, updateUser } = globalSlice.actions;
=======
export const { setMode, loginSuccess, logout, checkAuth } = globalSlice.actions;
>>>>>>> 6a2cba5a12363e44188d8128acc6aea9967c95e3

export default globalSlice.reducer;

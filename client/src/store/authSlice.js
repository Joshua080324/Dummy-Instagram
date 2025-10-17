import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../helpers/http';

const initialState = {
  user: null,
  token: localStorage.getItem('access_token') || null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
};

// Get user from token
const getUserFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
};

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/users/register', userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/users/login', credentials);
      localStorage.setItem('access_token', data.access_token);
      const user = getUserFromToken(data.access_token);
      return { token: data.access_token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Google Sign In
export const googleSignIn = createAsyncThunk(
  'auth/googleSignIn',
  async (googleToken, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/users/auth/google', { google_token: googleToken });
      localStorage.setItem('access_token', data.access_token);
      const user = getUserFromToken(data.access_token);
      return { token: data.access_token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Google sign in failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access_token');
    },
    clearError(state) {
      state.error = null;
    },
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    // Initialize user from token on app load
    initializeAuth(state) {
      const token = localStorage.getItem('access_token');
      if (token) {
        state.token = token;
        state.user = getUserFromToken(token);
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        // Registration doesn't auto-login
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Google Sign In
      .addCase(googleSignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  }
});

export const { logout, clearError, setUser, initializeAuth } = authSlice.actions;
export default authSlice.reducer;

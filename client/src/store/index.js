import { configureStore } from '@reduxjs/toolkit';
import likesReducer from './likesSlice';
import postsReducer from './postsSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    likes: likesReducer,
    posts: postsReducer,
    auth: authReducer,
  }
});

export default store;

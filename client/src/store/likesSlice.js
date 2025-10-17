import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../helpers/http';

const initialState = {
  likedById: {}, // postId -> boolean
  counts: {}, // postId -> number
  loading: {}, // postId -> boolean (loading state per post)
  error: null,
};

// Async thunk for toggling like
export const toggleLikeAsync = createAsyncThunk(
  'likes/toggleLike',
  async (postId, { rejectWithValue }) => {
    try {
      const { data } = await http.post(`/posts/${postId}/like`);
      return { postId, message: data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle like');
    }
  }
);

const likesSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    setLikeState(state, action) {
      const { postId, liked } = action.payload;
      state.likedById[postId] = liked;
    },
    setLikeCount(state, action) {
      const { postId, count } = action.payload;
      state.counts[postId] = count;
    },
    // Keep for backward compatibility or manual updates
    toggleLike(state, action) {
      const postId = action.payload;
      const current = !!state.likedById[postId];
      state.likedById[postId] = !current;
      state.counts[postId] = (state.counts[postId] || 0) + (current ? -1 : 1);
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(toggleLikeAsync.pending, (state, action) => {
        const postId = action.meta.arg;
        state.loading[postId] = true;
        state.error = null;
        
        // Optimistic update
        const current = !!state.likedById[postId];
        state.likedById[postId] = !current;
        state.counts[postId] = (state.counts[postId] || 0) + (current ? -1 : 1);
      })
      // Handle success
      .addCase(toggleLikeAsync.fulfilled, (state, action) => {
        const postId = action.meta.arg;
        state.loading[postId] = false;
        // State already updated optimistically
      })
      // Handle error - rollback optimistic update
      .addCase(toggleLikeAsync.rejected, (state, action) => {
        const postId = action.meta.arg;
        state.loading[postId] = false;
        state.error = action.payload;
        
        // Rollback optimistic update
        const current = !!state.likedById[postId];
        state.likedById[postId] = !current;
        state.counts[postId] = (state.counts[postId] || 0) + (current ? -1 : 1);
      });
  }
});

export const { setLikeState, setLikeCount, toggleLike } = likesSlice.actions;
export default likesSlice.reducer;

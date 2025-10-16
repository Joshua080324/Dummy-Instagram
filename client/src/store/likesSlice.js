import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  likedById: {}, // postId -> boolean
  counts: {}, // postId -> number
};

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
    toggleLike(state, action) {
      const postId = action.payload;
      const current = !!state.likedById[postId];
      state.likedById[postId] = !current;
      state.counts[postId] = (state.counts[postId] || 0) + (current ? -1 : 1);
    }
  }
});

export const { setLikeState, setLikeCount, toggleLike } = likesSlice.actions;
export default likesSlice.reducer;

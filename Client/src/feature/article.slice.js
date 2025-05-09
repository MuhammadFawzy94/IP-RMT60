import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch public articles (no authentication required)
export const fetchPublicArticles = createAsyncThunk(
  'article/fetchPublicArticles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://api.muhammadfawzy.web.id/pubposts');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch articles');
    }
  }
);

// Fetch articles for authenticated users
export const fetchUserArticles = createAsyncThunk(
  'article/fetchUserArticles',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      const response = await axios.get('https://api.muhammadfawzy.web.id/postsUser', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch articles');
    }
  }
);

// Create a new article (for mechanics)
export const createArticle = createAsyncThunk(
  'article/createArticle',
  async (articleData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      const response = await axios.post('https://api.muhammadfawzy.web.id/posts', articleData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create article');
    }
  }
);

// Delete an article (for mechanics)
export const deleteArticle = createAsyncThunk(
  'article/deleteArticle',
  async (articleId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      await axios.delete(`https://api.muhammadfawzy.web.id/posts/${articleId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return articleId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete article');
    }
  }
);

// Article slice
const articleSlice = createSlice({
  name: 'article',
  initialState: {
    articles: [],
    filteredArticles: [],
    loading: false,
    error: null,
    searchTerm: '',
    createFormVisible: false,
    createSuccess: false,
    deleteSuccess: false
  },
  reducers: {
    // Search articles
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      if (state.searchTerm) {
        state.filteredArticles = state.articles.filter(article => 
          article.title?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          article.content?.toLowerCase().includes(state.searchTerm.toLowerCase())
        );
      } else {
        state.filteredArticles = state.articles;
      }
    },
    
    // Toggle create form visibility
    toggleCreateForm: (state) => {
      state.createFormVisible = !state.createFormVisible;
      state.createSuccess = false;
      state.error = null;
    },
    
    // Reset success flags
    resetSuccessFlags: (state) => {
      state.createSuccess = false;
      state.deleteSuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch public articles
      .addCase(fetchPublicArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
        state.filteredArticles = action.payload;
      })
      .addCase(fetchPublicArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch user articles
      .addCase(fetchUserArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
        state.filteredArticles = action.payload;
      })
      .addCase(fetchUserArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create article
      .addCase(createArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.articles.unshift(action.payload);
        state.filteredArticles = state.filteredArticles.length > 0 
          ? [action.payload, ...state.filteredArticles]
          : [action.payload, ...state.articles];
        state.createSuccess = true;
        state.createFormVisible = false;
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      })
      
      // Delete article
      .addCase(deleteArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = state.articles.filter(article => article.id !== action.payload);
        state.filteredArticles = state.filteredArticles.filter(article => article.id !== action.payload);
        state.deleteSuccess = true;
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.deleteSuccess = false;
      });
  }
});

export const { setSearchTerm, toggleCreateForm, resetSuccessFlags } = articleSlice.actions;
export default articleSlice.reducer;
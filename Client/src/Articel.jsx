import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faNewspaper, 
  faSearch, 
  faPlus, 
  faTrash, 
  faTimes,
  faSpinner 
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { 
  fetchPublicArticles, 
  fetchUserArticles, 
  createArticle, 
  deleteArticle,
  setSearchTerm,
  toggleCreateForm,
  resetSuccessFlags
} from './feature/article.slice';

function Article() {
  const dispatch = useDispatch();
  const { 
    articles, 
    filteredArticles, 
    loading, 
    error, 
    searchTerm,
    createFormVisible,
    createSuccess,
    deleteSuccess
  } = useSelector(state => state.article);
  
  // Form state for creating a new article
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get appropriate articles on component mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      dispatch(fetchUserArticles());
    } else {
      dispatch(fetchPublicArticles());
    }
    
    // Reset all flags when component unmounts
    return () => {
      dispatch(resetSuccessFlags());
    };
  }, [dispatch]);
  
  // Show success notifications
  useEffect(() => {
    if (createSuccess) {
      Swal.fire({
        title: 'Success!',
        text: 'Article created successfully',
        icon: 'success',
        confirmButtonColor: '#28a745'
      });
    }
    
    if (deleteSuccess) {
      Swal.fire({
        title: 'Success!',
        text: 'Article deleted successfully',
        icon: 'success',
        confirmButtonColor: '#28a745'
      });
    }
  }, [createSuccess, deleteSuccess]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };
  
  // Handle creating a new article
  const handleCreateArticle = (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      Swal.fire({
        title: 'Error!',
        text: 'Title and content are required',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
      return;
    }
    
    dispatch(createArticle({ title, content }));
  };
  
  // Handle deleting an article
  const handleDeleteArticle = (articleId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteArticle(articleId));
      }
    });
  };
  
  // Check if user is a mechanic (can create articles)
  const isMechanic = () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return false;
      
      // If you're using JWT tokens, you can decode them to check role
      // This is a simple example - you might want to use a proper JWT decoder
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      return tokenData.role === 'mechanic';
    } catch (error) {
      return false;
    }
  };
  
  // Determine which articles to display
  const displayArticles = filteredArticles.length > 0 ? filteredArticles : articles;
  
  if (loading && articles.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading articles...</span>
        </div>
        <p className="mt-3">Loading articles...</p>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FontAwesomeIcon icon={faNewspaper} className="me-2" />
          Articles
        </h2>
        <div className="d-flex">
          <div className="input-group me-2">
            <span className="input-group-text bg-light">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          {isMechanic() && (
            <button 
              className="btn btn-primary" 
              onClick={() => dispatch(toggleCreateForm())}
            >
              <FontAwesomeIcon icon={createFormVisible ? faTimes : faPlus} className="me-2" />
              {createFormVisible ? 'Cancel' : 'New Article'}
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {/* Create article form */}
      {createFormVisible && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Create New Article</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateArticle}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="content" className="form-label">Content</label>
                <textarea
                  className="form-control"
                  id="content"
                  rows="5"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={() => dispatch(toggleCreateForm())}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                      Posting...
                    </>
                  ) : (
                    'Post Article'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Articles list */}
      {displayArticles.length > 0 ? (
        <div className="row">
          {displayArticles.map(article => (
            <div className="col-md-4 mb-4" key={article.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{article.title}</h5>
                  <p className="card-text">{article.content?.substring(0, 150)}...</p>
                </div>
                <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Published on {formatDate(article.createdAt)}
                  </small>
                  
                  {isMechanic() && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteArticle(article.id)}
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">No articles found</p>
        </div>
      )}
    </div>
  );
}

export default Article;
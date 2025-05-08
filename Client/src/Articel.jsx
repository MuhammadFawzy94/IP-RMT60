import { useEffect, useState } from "react";
import axios from "axios";
import { CardsPosts } from "./assets/Components/cards";

const Article = () => {
  const [dataPosts, setDataPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:80/pubposts");
        setDataPosts(response.data);
        setFilteredPosts(response.data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch articles. Please try again later.");
        setIsLoading(false);
        console.error(err);
      }
    }
    fetchData();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = dataPosts.filter(
      (post) =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [searchTerm, dataPosts]);

  return (
    <div className="article-container">

      {/* Hero Section */}
      <section className="hero-section text-center py-5 bg-primary text-white">
        <div className="container">
          <h1 className="display-4 fw-bold mb-3 animate__animated animate__fadeIn">
            Explore Our Articles
          </h1>
          <p className="lead mb-4 animate__animated animate__fadeIn animate__delay-1s">
            Discover tips, guides, and insights from automotive experts.
          </p>
          <div className="search-bar mx-auto animate__animated animate__fadeIn animate__delay-2s">
            <input
              type="text"
              className="form-control rounded-pill shadow-sm"
              placeholder="Search articles by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-5 bg-light">
        <div className="container">
          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}
          <div className="row">
            {isLoading
              ? // Skeleton Loading
                Array(6)
                  .fill()
                  .map((_, index) => (
                    <div className="col-md-4 mb-4" key={index}>
                      <div className="card skeleton-card">
                        <div className="skeleton-img"></div>
                        <div className="card-body">
                          <div className="skeleton-title"></div>
                          <div className="skeleton-text"></div>
                          <div className="skeleton-meta"></div>
                        </div>
                      </div>
                    </div>
                  ))
              : // Article Cards
                filteredPosts.length > 0 ? (
                  filteredPosts.map((post, index) => (
                    <div
                      className="col-md-4 mb-4 animate__animated animate__fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      key={post.id}
                    >
                      <CardsPosts data={post} />
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center">
                    <p className="text-muted">No articles found.</p>
                  </div>
                )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4">
        <div className="container">
          <p className="mb-0">© 2025 Mechanic Finder. All rights reserved.</p>
          <p className="mb-0">
            <a href="/about" className="text-white mx-2">About</a> |
            <a href="/contact" className="text-white mx-2">Contact</a>
          </p>
        </div>
      </footer>

      {/* Inline Styles */}
      <style jsx>{`
        .article-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .hero-section {
          background: linear-gradient(135deg, #007bff, #00b7eb);
          padding: 80px 0;
        }

        .search-bar {
          max-width: 500px;
        }

        .form-control {
          padding: 12px 20px;
          font-size: 1rem;
          border: none;
        }

        .form-control:focus {
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }

        /* Skeleton Loading */
        .skeleton-card {
          border: none;
          border-radius: 12px;
          overflow: hidden;
        }

        .skeleton-img {
          height: 200px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
        }

        .skeleton-title {
          height: 20px;
          width: 70%;
          background: #e0e0e0;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .skeleton-text {
          height: 60px;
          background: #e0e0e0;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .skeleton-meta {
          height: 15px;
          width: 50%;
          background: #e0e0e0;
          border-radius: 4px;
        }

        @keyframes skeleton-loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        footer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 60px 0;
          }

          .display-4 {
            font-size: 2.5rem;
          }

          .lead {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Article;
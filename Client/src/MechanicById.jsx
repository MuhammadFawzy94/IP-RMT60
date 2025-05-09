import axios from "axios";
import { useEffect, useState } from 'react';
import { NavLink, useParams } from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faWrench, faStar } from '@fortawesome/free-solid-svg-icons';

const MechanicById = () => {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await axios.get(`https://api.muhammadfawzy.web.id/mechanics/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            }
        );
        console.log("API Response:", response.data); // Debugging: Log respons API
        // Jika data dibungkus dalam properti 'data', gunakan response.data.data
        const mechanicData = response.data.data || response.data;
        setData(mechanicData);
        console.log("Set Data:", mechanicData); // Debugging: Log data yang disimpan
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err.response || err.message); // Debugging: Log error
        setError("Failed to fetch mechanic details. Please try again later.");
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  return (
    <div className="mechanic-detail-container min-vh-100 d-flex flex-column">
      {/* Hero Section */}
      <section className="hero-section text-center py-4 bg-primary text-white">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2 animate__animated animate__fadeIn">
            Mechanic Details
          </h1>
          <p className="lead mb-0 animate__animated animate__fadeIn animate__delay-1s">
            Learn more about our expert mechanics.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-5 bg-light flex-grow-1">
        <div className="container">
          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}
          {isLoading ? (
            // Skeleton Loading
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="card skeleton-card">
                  <div className="skeleton-img mx-auto"></div>
                  <div className="card-body text-center">
                    <div className="skeleton-title mx-auto mb-3"></div>
                    <div className="skeleton-text mx-auto mb-3"></div>
                    <div className="skeleton-button mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : !data || Object.keys(data).length === 0 ? (
            // Handle kasus data kosong
            <div className="row justify-content-center">
              <div className="col-md-8 text-center">
                <p className="text-muted">No mechanic data available.</p>
                <NavLink
                  to="/mechanics"
                  className="btn btn-outline-secondary py-2 mt-3"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Back to Mechanics
                </NavLink>
              </div>
            </div>
          ) : (
            // Mechanic Details
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="card border-0 shadow-lg animate__animated animate__fadeInUp">
                  <div className="card-body p-5 text-center">
                    <img
                      src={data.imageURL || "https://via.placeholder.com/500"}
                      className="img-fluid rounded-circle mb-4"
                      alt={data.fullName || "Mechanic"}
                      style={{ width: "200px", height: "200px", objectFit: "cover" }}
                    />
                    <h2 className="card-title mb-3 fw-bold">{data.fullName || "N/A"}</h2>
                    <p className="card-text text-muted mb-3">
                      <FontAwesomeIcon icon={faWrench} className="me-2" />
                      {data.speciality || "N/A"}
                    </p>
                    {data.experience && (
                      <p className="card-text text-muted mb-3">
                        Experience: {data.experience}
                      </p>
                    )}
                    {data.location && (
                        <p className="card-text text-muted mb-3">
                            Location: {data.location}
                        </p>
                    )}
                    {data.rating && (
                      <p className="card-text text-warning mb-4">
                        {[...Array(Math.round(data.rating))].map((_, i) => (
                          <FontAwesomeIcon key={i} icon={faStar} className="me-1" />
                        ))}
                        ({data.rating}/5)
                      </p>
                    )}
                    <NavLink to="/order" className="btn btn-primary w-100 py-2 fw-bold">
                      <FontAwesomeIcon icon={faWrench} className="me-2" />
                      Book Now
                    </NavLink>
                    <NavLink
                      to="/"
                      className="btn btn-outline-secondary w-100 py-2 mt-3"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                      Back to Home Page
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4">
        <div className="container">
          <p className="mb-0">© 2025 Mechanic Finder. All rights reserved.</p>
          <p className="mb-0">
            <NavLink to="/about" className="text-white mx-2">
              About
            </NavLink>
            |
            <NavLink to="/contact" className="text-white mx-2">
              Contact
            </NavLink>
          </p>
        </div>
      </footer>

      {/* Inline Styles */}
      <style jsx>{`
        .mechanic-detail-container {
          background: #f8f9fa;
        }

        .hero-section {
          background: linear-gradient(135deg, #007bff, #00b7eb);
        }

        .card {
          border-radius: 15px;
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
        }

        .img-fluid {
          transition: transform 0.3s ease;
        }

        .card:hover .img-fluid {
          transform: scale(1.05);
        }

        .btn-primary {
          border-radius: 8px;
          padding: 12px;
          transition: background-color 0.3s ease;
        }

        .btn-primary:hover {
          background-color: #0052cc;
        }

        .btn-outline-secondary {
          border-radius: 8px;
          padding: 12px;
          transition: all 0.3s ease;
        }

        .btn-outline-secondary:hover {
          background-color: #6c757d;
          color: #fff;
        }

        /* Skeleton Loading */
        .skeleton-card {
          border: none;
          border-radius: 15px;
          overflow: hidden;
          width: 100%;
          max-width: 500px;
        }

        .skeleton-img {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
        }

        .skeleton-title {
          height: 30px;
          width: 60%;
          background: #e0e0e0;
          border-radius: 4px;
        }

        .skeleton-text {
          height: 20px;
          width: 80%;
          background: #e0e0e0;
          border-radius: 4px;
        }

        .skeleton-button {
          height: 40px;
          width: 100%;
          background: #e0e0e0;
          border-radius: 8px;
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
            padding: 40px 0;
          }

          .display-5 {
            font-size: 2rem;
          }

          .lead {
            font-size: 1rem;
          }

          .card-body {
            padding: 1.5rem;
          }

          .skeleton-img {
            width: 150px;
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
};

export default MechanicById;
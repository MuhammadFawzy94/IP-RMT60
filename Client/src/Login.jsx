import { useEffect, useState } from 'react';
// Fix the import path
import { NavLink, Navigate, useNavigate } from 'react-router';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  // Client-side validation with better error visibility
  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    console.log("Validation errors:", newErrors); // Debug validation
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setServerError('');
    console.log("Login attempt with:", { email }); // Debug login attempt
    
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Sending login request to server");
      const { data } = await axios.post('https://api.muhammadfawzy.web.id/login', {
        email,
        password,
      });
      console.log("Login successful, response:", data); // Log successful response
      localStorage.setItem('access_token', data.access_token);
      navigate('/');
    } catch (err) {
      console.error("Login error:", err.response || err); // More detailed error logging
      setServerError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  async function handleCredentialResponse(response) {
    console.log("Google login response received:", response);
    try {
      const { data } = await axios.post("https://api.muhammadfawzy.web.id/googleLogin", {
        googleToken: response.credential,
      });
      console.log("Google login successful:", data);
      localStorage.setItem('access_token', data.access_token);
      navigate('/');
    } catch (error) {
      console.error("Google login error:", error.response || error);
      setServerError(error.response?.data?.message || 'Google login failed');
    }
  }

  useEffect(() => {
    // Load Google script dynamically to ensure it's available
    const loadGoogleScript = () => {
      // Check if script already exists
      if (document.getElementById('google-login')) {
        return;
      }
      
      console.log("Loading Google sign-in script");
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.id = "google-login";
      script.async = true;
      script.onload = () => {
        console.log("Google script loaded successfully");
        setGoogleScriptLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load Google script");
      };
      document.body.appendChild(script);
    };
    
    loadGoogleScript();
  }, []);

  // Initialize Google sign-in when script is loaded
  useEffect(() => {
    if (!googleScriptLoaded) return;
    
    if (window.google && window.google.accounts) {
      console.log("Initializing Google accounts API");
      
      // Use a specific client ID for debugging
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      
      console.log("Using client ID:", clientId);
      
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse
      });
      
      const buttonDiv = document.getElementById("buttonDiv");
      if (buttonDiv) {
        console.log("Rendering Google button");
        window.google.accounts.id.renderButton(
          buttonDiv,
          { theme: "outline", size: "large", width: 240 }
        );
      } else {
        console.error("Google button div not found");
      }
    } else {
      console.error("Google accounts API not available");
    }
  }, [googleScriptLoaded]);
  
  // Navigation Guard
  if (localStorage.getItem('access_token')) {
    console.log("User already logged in, redirecting to home");
    return <Navigate to="/" />;
  }

  return (
    <div className="login-container min-vh-100 d-flex flex-column">
      {/* Hero Section */}
      <section className="hero-section text-center py-4 bg-primary text-white">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2 animate__animated animate__fadeIn">
            Welcome Back
          </h1>
          <p className="lead mb-0 animate__animated animate__fadeIn animate__delay-1s">
            Log in to connect with top mechanics.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-5 bg-light flex-grow-1">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card border-0 shadow-lg animate__animated animate__fadeInUp">
                <div className="card-body p-5">
                  <h2 className="text-center mb-4 fw-bold">Login</h2>
                  
                  {/* Server error display */}
                  {serverError && (
                    <div className="alert alert-danger" role="alert">
                      {serverError}
                    </div>
                  )}
                  
                  <form onSubmit={handleLogin}>
                    {/* Email */}
                    <div className="mb-4 position-relative">
                      <label htmlFor="emailInput" className="form-label fw-medium">
                        Email Address
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <FontAwesomeIcon icon={faEnvelope} />
                        </span>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          id="emailInput"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      {/* Make sure error shows */}
                      {errors.email && (
                        <div className="invalid-feedback d-block">{errors.email}</div>
                      )}
                    </div>

                    {/* Password */}
                    <div className="mb-4 position-relative">
                      <label htmlFor="passwordInput" className="form-label fw-medium">
                        Password
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <FontAwesomeIcon icon={faLock} />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          id="passwordInput"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                      </div>
                      {/* Make sure error shows */}
                      {errors.password && (
                        <div className="invalid-feedback d-block">{errors.password}</div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 fw-bold mb-3"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </button>
                    
                    <div className="d-flex align-items-center justify-content-center my-3">
                      <hr className="flex-grow-1 me-3" />
                      <span className="text-muted">OR</span>
                      <hr className="flex-grow-1 ms-3" />
                    </div>
                    
                    {/* Google Sign-in button in a better position */}
                    <div id="buttonDiv" className="d-flex justify-content-center mb-3"></div>
                    
                    {!googleScriptLoaded && (
                      <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted small">Loading Google Sign-in...</p>
                      </div>
                    )}
                  </form>
                  
                  <p className="text-center mt-3 mb-0">
                    Don't have an account?{' '}
                    <NavLink to="/register" className="text-primary fw-medium">
                      Register
                    </NavLink>
                  </p>
                </div>
              </div>
            </div>
          </div>
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

      {/* Styles remain the same */}
      <style jsx>{`
        .login-container {
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

        .form-control {
          border-radius: 8px;
          padding: 12px;
          font-size: 1rem;
        }

        .input-group-text,
        .btn-outline-secondary {
          border: none;
          border-radius: 0;
        }

        .btn-outline-secondary {
          border-radius: 0 8px 8px 0;
        }

        .form-control:focus {
          box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
          border-color: #007bff;
        }

        .btn-primary {
          border-radius: 8px;
          padding: 12px;
          transition: background-color 0.3s ease;
        }

        .btn-primary:hover {
          background-color: #0052cc;
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .invalid-feedback {
          font-size: 0.9rem;
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
        }
      `}</style>
    </div>
  );
}
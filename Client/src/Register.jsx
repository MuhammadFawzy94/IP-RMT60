import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!address) newErrors.address = 'Address is required';
    if (!phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    else if (!/^\d{10,15}$/.test(phoneNumber)) newErrors.phoneNumber = 'Invalid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setServerError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await axios.post('http://localhost:80/register', {
        email,
        password,
        address,
        phoneNumber,
      });
      navigate('/login');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container min-vh-100 d-flex flex-column">
      {/* Hero Section */}
      <section className="hero-section text-center py-4 bg-primary text-white">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2 animate__animated animate__fadeIn">
            Join Mechanic Finder
          </h1>
          <p className="lead mb-0 animate__animated animate__fadeIn animate__delay-1s">
            Create an account to connect with top mechanics.
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
                  <h2 className="text-center mb-4 fw-bold">Register</h2>
                  {serverError && (
                    <div className="alert alert-danger" role="alert">
                      {serverError}
                    </div>
                  )}
                  <form onSubmit={handleRegister}>
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
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
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
                          type="password"
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          id="passwordInput"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>

                    {/* Address */}
                    <div className="mb-4 position-relative">
                      <label htmlFor="addressInput" className="form-label fw-medium">
                        Address
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                          id="addressInput"
                          placeholder="Enter your address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                    </div>

                    {/* Phone Number */}
                    <div className="mb-4 position-relative">
                      <label htmlFor="phoneInput" className="form-label fw-medium">
                        Phone Number
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <FontAwesomeIcon icon={faPhone} />
                        </span>
                        <input
                          type="tel"
                          className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                          id="phoneInput"
                          placeholder="Enter your phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.phoneNumber && (
                        <div className="invalid-feedback">{errors.phoneNumber}</div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 fw-bold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Registering...
                        </>
                      ) : (
                        'Register'
                      )}
                    </button>
                  </form>
                  <p className="text-center mt-3 mb-0">
                    Already have an account?{' '}
                    <NavLink to="/login" className="text-primary fw-medium">
                      Login
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

      {/* Inline Styles */}
      <style jsx>{`
        .register-container {
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

        .input-group-text {
          border: none;
          border-radius: 8px 0 0 8px;
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
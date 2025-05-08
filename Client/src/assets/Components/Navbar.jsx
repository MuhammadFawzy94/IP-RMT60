import { NavLink, Link, useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-body-warning-subtle">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          E-Mechanic
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" aria-current="page" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/articel">
                Articel
              </Link>
            </li>
          </ul>
          <form className="d-flex" role="search">
            <Link to="/login" className="btn btn-outline-primary me-2">
              Login
            </Link>
          </form>
        </div>
      </div>
    </nav>
  );
}

export function NavbarUser() {
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg bg-body-warning-subtle">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          E-Mechanic
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" aria-current="page" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/articel">
                Article
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/order`}>
                Booking
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/getOrder`}>
                Your Reserve
              </Link>
            </li>
            <NavLink to="/ai-assistant" className="nav-link">
              <FontAwesomeIcon icon={faRobot} className="me-2" />
              AI Assistant
            </NavLink>
          </ul>
          <form className="d-flex" role="search">
            <button
              onClick={() => {
                localStorage.removeItem("access_token");
                navigate("/login");
              }}
              className="btn btn-outline-danger"
              type="submit"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Cards, CardsPackage } from "./assets/Components/cards";
import { 
  fetchMechanics, 
  fetchPackages, 
  setSearchTerm 
} from "./feature/home.slice";

const HomeUser = () => {
  const dispatch = useDispatch();
  const {  
    filteredMechanics, 
    packages, 
    searchTerm, 
    isLoadingMechanics, 
    error 
  } = useSelector((state) => state.mechanic);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchMechanics());
    dispatch(fetchPackages());
  }, [dispatch]);

  // Handle search input change
  const handleSearchChange = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  return (
    <>
      <div className="home-container">
        {/* Hero Section */}
        <section className="hero-section text-center py-5 bg-primary text-white">
          <div className="container">
            <h1 className="display-4 fw-bold mb-3 animate__animated animate__fadeIn">
              Find Solution With My Mechanic
            </h1>
            <p className="lead mb-4 animate__animated animate__fadeIn animate__delay-1s">
              Connect with top-rated mechanics for all your vehicle needs.
            </p>
            <div className="search-bar mx-auto animate__animated animate__fadeIn animate__delay-2s">
              <input
                type="text"
                className="form-control rounded-pill shadow-sm"
                placeholder="Search by name or speciality or location..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </section>
        <br />
        <div>
          <h2 className="text-center mb-4">-------- Package List --------</h2>
        </div>

        {/* Packages Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row">
              {packages.map((dataPackage) => (
                <div className="col-md-3 mb-4" key={dataPackage.id}>
                  <CardsPackage dataPackage={dataPackage} />
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <div>
          <h2 className="text-center mb-4">
            -------- Featured Mechanics --------
          </h2>
        </div>
        
        {/* Main Content - Mechanics */}
        <section className="py-5 bg-light">
          <div className="container">
            {error && (
              <div className="alert alert-danger text-center" role="alert">
                {error}
              </div>
            )}
            <div className="row">
              {isLoadingMechanics ? (
                // Skeleton Loading
                Array(6)
                  .fill()
                  .map((_, index) => (
                    <div className="col-md-4 mb-4" key={index}>
                      <div className="card skeleton-card">
                        <div className="skeleton-img"></div>
                        <div className="card-body">
                          <div className="skeleton-title"></div>
                          <div className="skeleton-badge"></div>
                          <div className="skeleton-text"></div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : // Data Cards
              filteredMechanics.length > 0 ? (
                filteredMechanics.map((item, index) => (
                  <div
                    className="col-md-4 mb-4"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    key={item.id}
                  >
                    <Cards data={item} />
                  </div>
                ))
              ) : (
                <div className="col-12 text-center">
                  <p className="text-muted">No mechanics found.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-dark text-white text-center py-4">
          <div className="container">
            <p className="mb-0">
              &copy; 2025 Mechanic Finder. All rights reserved.
            </p>
            <p className="mb-0">
              <a href="/about" className="text-white mx-2">
                About
              </a>{" "}
              |
              <a href="/contact" className="text-white mx-2">
                Contact
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomeUser;
import { useEffect, useState } from "react";
import axios from "axios";
import { Cards } from "./assets/Components/cards";
import Navbar from "./assets/Components/Navbar";
; // Pastikan path ini benar

const Home = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:80/");
        setData(response.data);
        setFilteredData(response.data);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch mechanics. Please try again later.");
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  return (
    <>
        <Navbar />
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section text-center py-5 bg-primary text-white">
        <div className="container">
          <h1 className="display-4 fw-bold mb-3 animate__animated animate__fadeIn">
            Find Your Expert Mechanic
          </h1>
          <p className="lead mb-4 animate__animated animate__fadeIn animate__delay-1s">
            Connect with top-rated mechanics for all your vehicle needs.
          </p>
          <div className="search-bar mx-auto animate__animated animate__fadeIn animate__delay-2s">
            <input
              type="text"
              className="form-control rounded-pill shadow-sm"
              placeholder="Search by name or speciality or location"
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
                          <div className="skeleton-badge"></div>
                          <div className="skeleton-text"></div>
                        </div>
                      </div>
                    </div>
                  ))
              : // Data Cards
                filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
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
          <p className="mb-0">&copy; 2025 Mechanic Finder. All rights reserved.</p>
          <p className="mb-0">
            <a href="/about" className="text-white mx-2">About</a> | 
            <a href="/contact" className="text-white mx-2">Contact</a>
          </p>
        </div>
      </footer>

      
    </div>
    </>
  );
};

export default Home;
import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faCalendarAlt,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import {
  selectPackage,
  setOrderDate,
  setOrderNote,
  resetOrderForm,
  createOrder,
} from "./feature/order.slice";

function Order() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux
  const {
    servicePackages,
    selectedPackage,
    orderDate,
    orderNote,
    loading,
    error,
  } = useSelector((state) => state.order);

  // Set initial package if coming from package selection
  useEffect(() => {
    const initialPackageData = location.state?.packageData;
    if (initialPackageData) {
      dispatch(selectPackage(initialPackageData));
    }
  }, [location.state, dispatch]);

  // Clear form when component is unmounted
  useEffect(() => {
    return () => {
      dispatch(resetOrderForm());
    };
  }, [dispatch]);

  const handlePackageSelect = (pkg) => {
    dispatch(selectPackage(pkg));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!selectedPackage) {
      Swal.fire({
        title: "Error!",
        text: "Please select a service package.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#f8bb86",
      });
      return;
    }

    if (!orderDate) {
      Swal.fire({
        title: "Error!",
        text: "Please select a service date.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#f8bb86",
      });
      return;
    }

    const orderData = {
      description: orderNote,
      status: "pending",
      date: new Date(orderDate).toISOString(),
      PackageId: selectedPackage.id,
    };

    // Dispatch create order action
    const resultAction = await dispatch(createOrder(orderData));

    if (createOrder.fulfilled.match(resultAction)) {
      // Success - show success message
      Swal.fire({
        title: "Success!",
        text: "Booking created successfully!",
        icon: "success",
        confirmButtonText: "View Orders",
        confirmButtonColor: "#007bff",
      }).then(() => {
        navigate("/getOrder", {
          state: {
            orderData: {
              id: resultAction.payload.id || resultAction.payload.data?.id,
              packageName: selectedPackage.namePackage,
              description: selectedPackage.description,
              price: selectedPackage.price,
              orderNote: orderNote,
              serviceDate: orderDate,
              imgUrl: selectedPackage.imgUrl,
              PackageId: selectedPackage.PackageId,
            },
          },
        });
      });
    }
  };

  // Calculate minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                Create Service Booking
              </h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitOrder}>
                {/* Service Package Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Select Service Package
                  </label>
                  <div className="row row-cols-1 row-cols-md-2 g-3">
                    {servicePackages.map((pkg) => (
                      <div className="col" key={pkg.id}>
                        <div
                          className={`card h-100 ${
                            selectedPackage?.id === pkg.id
                              ? "border-primary"
                              : "border"
                          }`}
                          onClick={() => handlePackageSelect(pkg)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="card-body d-flex align-items-center">
                            <div className="me-3">
                              <div className="icon-circle bg-primary bg-opacity-10 p-3 rounded-circle">
                                <FontAwesomeIcon
                                  icon={pkg.icon}
                                  className="text-primary fs-4"
                                />
                              </div>
                            </div>
                            <div>
                              <h6 className="card-title mb-1">
                                {pkg.namePackage}
                              </h6>
                              <p className="card-text text-muted small mb-1">
                                {pkg.description.substring(0, 50)}...
                              </p>
                              <span className="fw-bold text-success">
                                Rp {pkg.price.toLocaleString("id-ID")}
                              </span>
                            </div>
                            {selectedPackage?.id === pkg.id && (
                              <div className="ms-auto">
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="text-primary fs-4"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Date */}
                <div className="mb-3">
                  <label htmlFor="orderDate" className="form-label fw-bold">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    Service Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="orderDate"
                    value={orderDate}
                    onChange={(e) => dispatch(setOrderDate(e.target.value))}
                    min={minDate}
                    required
                  />
                  <div className="form-text">
                    Please select a date for your service appointment.
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mb-4">
                  <label htmlFor="orderNote" className="form-label fw-bold">
                    Additional Notes
                  </label>
                  <textarea
                    id="orderNote"
                    className="form-control"
                    rows="4"
                    value={orderNote}
                    onChange={(e) => dispatch(setOrderNote(e.target.value))}
                    placeholder="Please provide any specific requirements or describe issues with your vehicle..."
                  />
                </div>

                {/* Order Summary */}
                {selectedPackage && (
                  <div className="mb-4 p-3 bg-light rounded">
                    <h5 className="mb-3">Booking Summary</h5>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Service Package:</span>
                      <span className="fw-bold">
                        {selectedPackage.namePackage}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Price:</span>
                      <span className="fw-bold text-success">
                        Rp {selectedPackage.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    {orderDate && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Date:</span>
                        <span className="fw-bold">
                          {new Date(orderDate).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading || !selectedPackage || !orderDate}
                  >
                    {loading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Processing...
                      </span>
                    ) : (
                      <span>
                        <FontAwesomeIcon icon={faCheck} className="me-2" />
                        Complete Booking
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Back
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Order;

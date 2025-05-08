import { useEffect } from 'react';
import { NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faSync, faTrash, faCheckCircle, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2';
import { fetchOrders, deleteOrder, completeOrder } from './feature/orderBYId.slice';

const OrderList = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(state => state.orderById);
  const navigate = useNavigate();

  // Fetch orders on component mount
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Format date - kept as internal function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Delete order function with SweetAlert confirmation
  const handleDeleteOrder = (orderId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(deleteOrder(orderId)).unwrap();
          
          // Success message with SweetAlert
          Swal.fire({
            title: 'Deleted!',
            text: 'Your order has been deleted.',
            icon: 'success',
            confirmButtonColor: '#28a745'
          });
        } catch (err) {
          // Error message with SweetAlert
          Swal.fire({
            title: 'Error!',
            text: err || "Failed to delete order",
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      }
    });
  };

  // Complete order function with SweetAlert
  const handleCompleteOrder = async (orderId) => {
    try {
      await dispatch(completeOrder(orderId)).unwrap();
      
      // Success message with SweetAlert
      Swal.fire({
        title: 'Success!',
        text: 'Order marked as completed. You can now proceed to payment.',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#28a745'
      });
    } catch (err) {
      // Error message with SweetAlert
      Swal.fire({
        title: 'Error!',
        text: err || "Failed to complete order",
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  };

  // Proceed to payment with SweetAlert confirmation
  const handleProceedToPayment = (order) => {
    Swal.fire({
      title: 'Proceed to Payment?',
      text: `You are about to pay for ${order.Package?.namePackage} (Rp ${order.Package?.price?.toLocaleString('id-ID')})`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/payment", { 
          state: { 
            orderData: {
              id: order.id,
              packageName: order.Package?.namePackage,
              description: order.description,
              price: order.Package?.price,
              serviceDate: order.date,
              status: order.status
            }
          }
        });
      }
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning text-dark';
      case 'paid':
        return 'bg-info';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Handle refresh button click with SweetAlert notification
  const handleRefresh = () => {
    dispatch(fetchOrders());
    
    // Show a toast notification
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    
    Toast.fire({
      icon: 'info',
      title: 'Refreshing orders...'
    });
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger" role="alert">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          {error}
        </div>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate("/home")}
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2>No orders found</h2>
        <p>You haven't placed any orders yet.</p>
        <NavLink to="/" className="btn btn-primary mt-3">
          Get Order
        </NavLink>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Orders</h2>
        <div>
          <button onClick={handleRefresh} className="btn btn-outline-primary me-2" disabled={loading}>
            <FontAwesomeIcon icon={faSync} spin={loading} className="me-2" />
            Refresh
          </button>
          <NavLink to="/packages" className="btn btn-primary">
            New Order
          </NavLink>
        </div>
      </div>

      <div className="row">
        {orders.map(order => (
          <div className="col-md-6 mb-4" key={order.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-bold">Order #{order.id}</span>
                <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h5 className="card-title text-primary">
                    {order.Package?.namePackage || 'No package information'}
                  </h5>
                  <h6 className="text-success mb-3">
                    {order.Package?.price ? `Rp ${order.Package.price.toLocaleString('id-ID')}` : ''}
                  </h6>
                </div>
                
                <div className="small text-muted mb-3">
                  <div><strong>Date:</strong> {formatDate(order.date)}</div>
                </div>
                
                <p className="card-text">
                  {order.description || 'No additional notes'}
                </p>
              </div>
              <div className="card-footer bg-white d-flex justify-content-between">
                <div>
                  <button 
                    className="btn btn-sm btn-outline-danger me-2"
                    onClick={() => handleDeleteOrder(order.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="me-1" />
                    Delete
                  </button>
                </div>
                
                {order.status === 'pending' ? (
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => handleCompleteOrder(order.id)}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    Complete
                  </button>
                ) : order.status === 'completed' ? (
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleProceedToPayment(order)}
                  >
                    <FontAwesomeIcon icon={faCreditCard} className="me-1" />
                    Proceed to Payment
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
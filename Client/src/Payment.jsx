import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import {
  initiatePayment,
  checkPaymentStatus,
  deleteOrder,
  setSnapScriptLoaded,
  clearPaymentState,
} from './feature/payment.slice';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orderData = location.state?.orderData;
  
  // Get state from Redux
  const {
    loading,
    error,
    snapToken,
    paymentSuccess,
    snapScriptLoaded
  } = useSelector(state => state.payment);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearPaymentState());
    };
  }, [dispatch]);
  
  // Check if order data exists
  useEffect(() => {
    if (!orderData) {
      Swal.fire({
        title: 'Error',
        text: 'Order data not found',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      }).then(() => {
        navigate('/getOrder');
      });
    }
  }, [orderData, navigate]);
  
  // Initiate payment when component mounts
  useEffect(() => {
    if (orderData) {
      dispatch(initiatePayment(orderData.id));
    }
  }, [dispatch, orderData]);
  
  // Load Midtrans Snap script when snapToken is available
  useEffect(() => {
    if (snapToken && !snapScriptLoaded) {
      const snapScript = document.createElement('script');
      snapScript.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      snapScript.setAttribute('data-client-key', 'SB-Mid-client-9tl_GbhBlG5vgaVL');
      
      snapScript.onload = () => {
        dispatch(setSnapScriptLoaded(true));
      };
      
      snapScript.onerror = () => {
        Swal.fire({
          title: 'Error',
          text: 'Failed to load payment gateway',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      };
      
      document.head.appendChild(snapScript);
    }
  }, [snapToken, snapScriptLoaded, dispatch]);
  
  // Handle successful payment
  const handlePaymentSuccess = async () => {
    // Show loading state
    Swal.fire({
      title: 'Processing Payment',
      text: 'Please wait while we confirm your payment',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Delete the order
    const resultAction = await dispatch(deleteOrder(orderData.id));
    
    if (deleteOrder.fulfilled.match(resultAction)) {
      Swal.fire({
        title: 'Payment Successful!',
        text: 'Your order has been processed',
        icon: 'success',
        confirmButtonText: 'View Orders',
        confirmButtonColor: '#198754'
      }).then(() => {
        navigate('/getOrder', { state: { paymentSuccess: true } });
      });
    } else {
      // Show warning but still navigate
      Swal.fire({
        title: 'Payment Successful',
        text: 'Your payment was successful, but there was an issue updating your order. Our team will fix this for you.',
        icon: 'warning',
        confirmButtonText: 'View Orders',
        confirmButtonColor: '#ffc107'
      }).then(() => {
        navigate('/getOrder', { state: { paymentSuccess: true } });
      });
    }
  };
  
  // Check status of a payment
  const handleCheckStatus = async () => {
    const resultAction = await dispatch(checkPaymentStatus(orderData.id));
    
    if (checkPaymentStatus.fulfilled.match(resultAction)) {
      const paymentStatus = resultAction.payload.paymentStatus;
      
      if (paymentStatus === 'paid') {
        try {
          // Delete the order
          await dispatch(deleteOrder(orderData.id));
          
          Swal.fire({
            title: 'Payment Verified',
            text: 'Your payment has been successfully verified',
            icon: 'success',
            confirmButtonText: 'View Orders',
            confirmButtonColor: '#198754'
          }).then(() => {
            navigate('/getOrder', { state: { paymentSuccess: true } });
          });
        } catch (deleteErr) {
          console.error("Error deleting order after payment verification:", deleteErr);
          
          // Still navigate even if there was an error
          Swal.fire({
            title: 'Payment Verified',
            text: 'Your payment was verified, but there was an issue updating your order. Our team will fix this for you.',
            icon: 'warning',
            confirmButtonText: 'View Orders',
            confirmButtonColor: '#ffc107'
          }).then(() => {
            navigate('/getOrder', { state: { paymentSuccess: true } });
          });
        }
      }
    } else {
      // Show error with SweetAlert
      Swal.fire({
        title: 'Error',
        text: 'Failed to check payment status',
        icon: 'error',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#dc3545'
      });
    }
  };
  
  // Open payment popup
  const openPaymentPopup = () => {
    if (window.snap && snapToken && snapScriptLoaded) {
      window.snap.pay(snapToken, {
        onSuccess: function(result) {
          handlePaymentSuccess();
        },
        onPending: function(result) {
          Swal.fire({
            title: 'Payment Pending',
            text: 'Please complete your payment',
            icon: 'info',
            confirmButtonText: 'OK',
            confirmButtonColor: '#0d6efd'
          });
          handleCheckStatus();
        },
        onError: function(result) {
          Swal.fire({
            title: 'Payment Failed',
            text: 'Please try again or choose another payment method',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#dc3545'
          });
          console.error("Payment error:", result);
        },
        onClose: function() {
          // Show toast notification when payment window is closed
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
          
          Toast.fire({
            icon: 'info',
            title: 'Checking payment status...'
          });
          
          handleCheckStatus();
        }
      });
    } else {
      // Show error with SweetAlert if snap is not available
      Swal.fire({
        title: 'Payment Gateway Not Ready',
        text: 'Please wait for the payment system to load or refresh the page',
        icon: 'warning',
        confirmButtonText: 'Refresh',
        confirmButtonColor: '#0d6efd'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    }
  };
  
  // If payment is successful, redirect
  useEffect(() => {
    if (paymentSuccess) {
      navigate('/getOrder', { state: { paymentSuccess: true } });
    }
  }, [paymentSuccess, navigate]);
  
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-6 mx-auto">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                Payment
              </h4>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <div className="text-center mb-4">
                {loading ? (
                  <div>
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                    <p className="mt-2">Initializing payment...</p>
                  </div>
                ) : (
                  <>
                    <h5 className="mb-3">Order Summary</h5>
                    {orderData && (
                      <div className="p-3 bg-light rounded mb-4 text-start">
                        <div className="d-flex justify-content-between mb-2">
                          <span>Package:</span>
                          <span className="fw-bold">{orderData.packageName}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Amount:</span>
                          <span className="fw-bold text-success">
                            Rp {orderData.price?.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Date:</span>
                          <span>{new Date(orderData.serviceDate).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      className="btn btn-primary btn-lg w-100"
                      onClick={openPaymentPopup}
                      disabled={!snapToken || !snapScriptLoaded}
                    >
                      <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                      Pay Now
                    </button>
                    
                    <p className="mt-3 text-muted small">
                      Click the button above to open the payment window. You'll be
                      redirected after successful payment.
                    </p>
                  </>
                )}
              </div>
              
              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    // Confirm before navigating away from payment
                    if (snapToken) {
                      Swal.fire({
                        title: 'Leave Payment Page?',
                        text: 'Your payment process will be cancelled',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, go back',
                        cancelButtonText: 'No, stay here',
                        confirmButtonColor: '#6c757d',
                        cancelButtonColor: '#0d6efd'
                      }).then((result) => {
                        if (result.isConfirmed) {
                          navigate('/getOrder');
                        }
                      });
                    } else {
                      navigate('/getOrder');
                    }
                  }}
                  disabled={loading}
                >
                  Back to Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
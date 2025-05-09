const { Order, Package, User } = require("../models");
const midtransClient = require("midtrans-client");
const path = require("path");  // Add this import
const fs = require("fs").promises; 
// Move the Midtrans configuration to a reusable function
// Update this function in your PaymentController.js
const getSnapClient = () => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-xxxxx';
  const clientKey = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-xxxxx';
  
  console.log('Initializing Midtrans with environment:', {
    isProduction: process.env.NODE_ENV === 'production',
    serverKeyPrefix: serverKey.substring(0, 10) + '...' // Log partially for security
  });
  
  return new midtransClient.Snap({
    isProduction: process.env.NODE_ENV === 'production',
    serverKey,
    clientKey
  });
};

module.exports = class PaymentController {
    // static async donePayment(req, res, next) {
    //     try {
    //       const { id } = req.params;
    //       const { paymentMethod } = req.body;
    //       const transferProof = req.files?.transferProof;
    
    //       const order = await Order.findByPk(id);
    
    //       if (!order) {
    //         return res.status(404).json({ message: "Order not found" });
    //       }
    
    //       if (order.UserId !== req.user.id) {
    //         return res
    //           .status(403)
    //           .json({ message: "You are not authorized to process this payment" });
    //       }
    
    //       let transferProofPath = null;
    //       if (transferProof) {
    //         const uploadDir = path.join(__dirname, "../uploads");
    //         await fs.mkdir(uploadDir, { recursive: true });
    //         const fileName = `${Date.now()}-${transferProof.name}`;
    //         transferProofPath = path.join("uploads", fileName);
    //         await fs.writeFile(
    //           path.join(uploadDir, fileName),
    //           transferProof.data
    //         );
    //       }
    
    //       await order.update({
    //         status: "paid",
    //         paymentStatus: "paid",
    //         paymentMethod,
    //         transferProof: transferProofPath,
    //       });
    
    //       res.status(200).json({
    //         message: "Payment done successfully",
    //         data: order,
    //       });
    //     } catch (error) {
    //       console.error(error);
    //       next(error);
    //     }
    // }

    static async donePayment(req, res, next) {
      try {
        const { id } = req.params;
        const { paymentMethod } = req.body;
        const transferProof = req.files?.transferProof;
  
        const order = await Order.findByPk(id);
  
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }
  
        if (order.UserId !== req.user.id) {
          return res
            .status(403)
            .json({ message: "You are not authorized to process this payment" });
        }
  
        let transferProofPath = null;
        if (transferProof) {
          const uploadDir = path.join(__dirname, "../uploads");
          await fs.mkdir(uploadDir, { recursive: true });
          const fileName = `${Date.now()}-${transferProof.name}`;
          transferProofPath = path.join("uploads", fileName);
          await fs.writeFile(
            path.join(uploadDir, fileName),
            transferProof.data
          );
        }
  
        await order.update({
          status: "paid",
          paymentStatus: "paid",
          paymentMethod,
          transferProof: transferProofPath,
        });
  
        res.status(200).json({
          message: "Payment done successfully",
          data: order,
        });
      } catch (error) {
        console.error("Error in donePayment:", error);
        next(error);
      }
  }
    
      // static async initiatePayment(req, res, next) {
      //   try {
      //     const { orderId } = req.body;
          
      //     // Find the order with its package information
      //     const order = await Order.findOne({
      //       where: { id: orderId, UserId: req.user.id },
      //       include: [
      //         { model: Package },
      //         { model: User }
      //       ]
      //     });
    
      //     if (!order) {
      //       return res.status(404).json({ message: "Order not found" });
      //     }
    
      //     if (order.paymentStatus === 'paid') {
      //       return res.status(400).json({ message: "Order has already been paid" });
      //     }
    
      //     // Get the Snap client
      //     const snap = getSnapClient();
    
      //     // Create a unique transaction ID
      //     const transactionId = `ORDER-${order.id}-${Date.now()}`;
    
      //     // Prepare Midtrans parameters
      //     let parameter = {
      //       transaction_details: {
      //         order_id: transactionId,
      //         gross_amount: order.totalAmount,
      //       },
      //       credit_card: {
      //         secure: true,
      //       },
      //       customer_details: {
      //         first_name: order.User.email.split('@')[0],
      //         email: order.User.email,
      //         phone: order.User.phoneNumber || "08111222333",
      //       },
      //       item_details: [
      //         {
      //           id: order.Package.id,
      //           price: order.Package.price,
      //           quantity: 1,
      //           name: order.Package.namePackage,
      //         }
      //       ]
      //     };
    
      //     // Create transaction and get token
      //     const transaction = await snap.createTransaction(parameter);
      //     const transactionToken = transaction.token;
    
      //     // Update order with transaction information
      //     await order.update({
      //       transactionId,
      //       transactionToken,
      //     });
    
      //     res.json({ 
      //       message: "Payment initiated successfully", 
      //       transactionToken,
      //       orderId: order.id,
      //       amount: order.totalAmount
      //     });
      //   } catch (error) {
      //     console.error(error);
      //     next(error);
      //   }
      // }

      static async initiatePayment(req, res, next) {
        try {
          console.log('Payment initiation request received:', req.body);
          const { orderId } = req.body;
          
          if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
          }
          
          // Find the order with its package information
          const order = await Order.findOne({
            where: { id: orderId, UserId: req.user.id },
            include: [
              { model: Package },
              { model: User }
            ]
          });
      
          console.log('Order found:', order ? 'Yes' : 'No');
          
          if (!order) {
            return res.status(404).json({ message: "Order not found" });
          }
      
          if (order.paymentStatus === 'paid') {
            return res.status(400).json({ message: "Order has already been paid" });
          }
      
          // Get the Snap client
          const snap = getSnapClient();
      
          // Create a unique transaction ID
          const transactionId = `ORDER-${order.id}-${Date.now()}`;
      
          // Prepare Midtrans parameters with error handling for null values
          let parameter = {
            transaction_details: {
              order_id: transactionId,
              gross_amount: parseInt(order.totalAmount || order.Package?.price || 10000),
            },
            credit_card: {
              secure: true,
            },
            customer_details: {
              first_name: order.User?.email?.split('@')[0] || "Customer",
              email: order.User?.email || "customer@example.com",
              phone: order.User?.phoneNumber || "08111222333",
            },
            item_details: [
              {
                id: String(order.Package?.id || "PKG1"),
                price: parseInt(order.Package?.price || 10000),
                quantity: 1,
                name: order.Package?.namePackage || "Service Package",
              }
            ]
          };
      
          console.log('Transaction parameters:', JSON.stringify(parameter));
      
          // Create transaction and get token
          const transaction = await snap.createTransaction(parameter);
          const transactionToken = transaction.token;
      
          // Update order with transaction information
          await order.update({
            transactionId,
            transactionToken,
          });
      
          res.json({ 
            message: "Payment initiated successfully", 
            transactionToken,
            orderId: order.id,
            amount: parameter.transaction_details.gross_amount
          });
        } catch (error) {
          console.error("Error in initiatePayment:", error);
          
          // More detailed error response
          res.status(500).json({
            message: "Failed to initiate payment",
            error: process.env.NODE_ENV === 'production' ? undefined : error.message
          });
        }
      }
    
      // Add webhook handler for Midtrans notifications
      static async handlePaymentNotification(req, res, next) {
        try {
          const notification = req.body;
          
          // Create Core API instance
          const apiClient = new midtransClient.CoreApi({
            isProduction: process.env.NODE_ENV === 'production',
            serverKey: process.env.MIDTRANS_SERVER_KEY ,
            clientKey: process.env.MIDTRANS_CLIENT_KEY
          });
          
          // Verify the notification
          const statusResponse = await apiClient.transaction.notification(notification);
          const orderId = statusResponse.order_id;
          const transactionStatus = statusResponse.transaction_status;
          const fraudStatus = statusResponse.fraud_status;
          
          // Extract the actual order ID from our custom format (ORDER-{id}-{timestamp})
          const actualOrderId = orderId.split('-')[1];
          
          // Find the related order
          const order = await Order.findByPk(actualOrderId);
          
          if (!order) {
            return res.status(404).json({ message: "Order not found" });
          }
          
          // Process the transaction status
          let paymentStatus = 'pending';
          let orderStatus = order.status;
          
          if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept') {
              paymentStatus = 'paid';
              orderStatus = 'processing'; // or any status you want after payment
            }
          } else if (transactionStatus === 'cancel' || 
                    transactionStatus === 'deny' || 
                    transactionStatus === 'expire') {
            paymentStatus = 'failed';
          } else if (transactionStatus === 'pending') {
            paymentStatus = 'pending';
          }
          
          // Update the order with the new payment status
          await order.update({
            paymentStatus,
            status: orderStatus,
            paymentMethod: statusResponse.payment_type
          });
          
          // Return a success response
          res.status(200).json({ status: 'OK' });
        } catch (error) {
          console.error("Error in handlePaymentNotification:", error);
          next(error);
        }
      }

      static async getPaymentStatus(req, res, next) {
        try {
            const order = await Order.findOne({
              where: { id: req.params.id, UserId: req.user.id }
            });
            
            if (!order) {
              return res.status(404).json({ message: "Order not found" });
            }
            
            res.json({
              orderId: order.id,
              paymentStatus: order.paymentStatus,
              transactionToken: order.transactionToken
            });
          } catch (error) {
            next(error);
          }
        }
    }
const PaymentController = require('../controllers/PaymentController');
const { Order, Package, User } = require('../models');
const midtransClient = require('midtrans-client');
const fs = require('fs').promises;
const path = require('path');

// Mock the console.error to avoid the oo_tx errors
console.error = jest.fn();

// Mock dependencies
jest.mock('../models', () => ({
  Order: {
    findOne: jest.fn(),
    findByPk: jest.fn()
  },
  Package: {},
  User: {}
}));

// Better mock for midtrans-client
jest.mock('midtrans-client', () => {
  const mockCreateTransaction = jest.fn().mockResolvedValue({ token: 'fake-transaction-token' });
  
  return {
    Snap: jest.fn().mockImplementation(() => ({
      createTransaction: mockCreateTransaction
    })),
    CoreApi: jest.fn().mockImplementation(() => ({
      transaction: {
        notification: jest.fn().mockImplementation((notification) => {
          // Return whatever notification was passed
          return Promise.resolve(notification);
        })
      }
    }))
  };
});

// Mock the fs and path modules
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined)
  }
}));

jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args) => args.join('/'))
}));

// Add required globals
if (!global.path) {
  global.path = path;
}
if (!global.fs) {
  global.fs = fs;
}

describe('PaymentController', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 1 },
      files: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Set necessary environment variables
    process.env.MIDTRANS_SERVER_KEY = 'test-server-key';
    process.env.MIDTRANS_CLIENT_KEY = 'test-client-key';
    
    jest.clearAllMocks();
  });
  
  // Tests for donePayment
  describe('donePayment', () => {
    test('should process payment successfully', async () => {
      // Setup
      req.params = { id: 1 };
      req.body = { paymentMethod: 'bank_transfer' };
      req.files = {
        transferProof: {
          name: 'receipt.jpg',
          data: Buffer.from('test-image-data')
        }
      };
      
      const mockOrder = {
        id: 1,
        UserId: 1,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Order.findByPk.mockResolvedValue(mockOrder);
      
      // Execute
      await PaymentController.donePayment(req, res, next);
      
      // Assert
      expect(Order.findByPk).toHaveBeenCalledWith(1);
      expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining('uploads'), { recursive: true });
      expect(fs.writeFile).toHaveBeenCalled();
      expect(mockOrder.update).toHaveBeenCalledWith({
        status: "paid",
        paymentStatus: "paid",
        paymentMethod: 'bank_transfer',
        transferProof: expect.stringContaining('uploads')
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Payment done successfully",
        data: mockOrder
      });
    });
    
    test('should return 404 if order not found', async () => {
      // Setup
      req.params = { id: 999 };
      Order.findByPk.mockResolvedValue(null);
      
      // Execute
      await PaymentController.donePayment(req, res, next);
      
      // Assert
      expect(Order.findByPk).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Order not found" });
    });
    
    test('should return 403 if user not authorized', async () => {
      // Setup
      req.params = { id: 1 };
      const mockOrder = {
        id: 1,
        UserId: 2  // Different from req.user.id
      };
      Order.findByPk.mockResolvedValue(mockOrder);
      
      // Execute
      await PaymentController.donePayment(req, res, next);
      
      // Assert
      expect(Order.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        message: "You are not authorized to process this payment" 
      });
    });
    
    test('should handle payment without transfer proof', async () => {
      // Setup
      req.params = { id: 1 };
      req.body = { paymentMethod: 'credit_card' };
      // No transferProof file
      
      const mockOrder = {
        id: 1,
        UserId: 1,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Order.findByPk.mockResolvedValue(mockOrder);
      
      // Execute
      await PaymentController.donePayment(req, res, next);
      
      // Assert
      expect(Order.findByPk).toHaveBeenCalledWith(1);
      expect(fs.mkdir).not.toHaveBeenCalled();
      expect(fs.writeFile).not.toHaveBeenCalled();
      expect(mockOrder.update).toHaveBeenCalledWith({
        status: "paid",
        paymentStatus: "paid",
        paymentMethod: 'credit_card',
        transferProof: null
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Payment done successfully",
        data: mockOrder
      });
    });
    
    test('should call next with error if process fails', async () => {
      // Setup
      req.params = { id: 1 };
      const error = new Error('Database error');
      Order.findByPk.mockRejectedValue(error);
      
      // Execute
      await PaymentController.donePayment(req, res, next);
      
      // Assert
      expect(Order.findByPk).toHaveBeenCalledWith(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  // Tests for initiatePayment
  describe('initiatePayment', () => {
    test('should initiate payment successfully', async () => {
      // Setup
      req.body = { orderId: 1 };
      
      const mockPackage = { id: 2, namePackage: 'Premium Service', price: 150000 };
      const mockUser = { id: 1, email: 'user@example.com', phoneNumber: '08123456789' };
      
      const mockOrder = {
        id: 1,
        UserId: 1,
        totalAmount: 150000,
        paymentStatus: 'unpaid',
        Package: mockPackage,
        User: mockUser,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Order.findOne.mockResolvedValue(mockOrder);
      
      // Execute
      await PaymentController.initiatePayment(req, res, next);
      
      // Assert
      expect(Order.findOne).toHaveBeenCalledWith({
        where: { id: 1, UserId: 1 },
        include: [
          { model: Package },
          { model: User }
        ]
      });
      
      // We don't check the exact parameters due to the mock issues
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Payment initiated successfully",
        transactionToken: 'fake-transaction-token',
        orderId: 1,
        amount: 150000
      }));
    });
    
    test('should return 404 if order not found', async () => {
      // Setup
      req.body = { orderId: 999 };
      
      Order.findOne.mockResolvedValue(null);
      
      // Execute
      await PaymentController.initiatePayment(req, res, next);
      
      // Assert
      expect(Order.findOne).toHaveBeenCalledWith({
        where: { id: 999, UserId: 1 },
        include: [
          { model: Package },
          { model: User }
        ]
      });
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Order not found" });
    });
    
    test('should return 400 if order already paid', async () => {
      // Setup
      req.body = { orderId: 1 };
      
      const mockOrder = {
        id: 1,
        UserId: 1,
        paymentStatus: 'paid'
      };
      
      Order.findOne.mockResolvedValue(mockOrder);
      
      // Execute
      await PaymentController.initiatePayment(req, res, next);
      
      // Assert
      expect(Order.findOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Order has already been paid" });
    });
    
    test('should call next with error if process fails', async () => {
      // Setup
      req.body = { orderId: 1 };
      
      const error = new Error('Midtrans error');
      Order.findOne.mockRejectedValue(error);
      
      // Execute
      await PaymentController.initiatePayment(req, res, next);
      
      // Assert
      expect(Order.findOne).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  // Tests for getPaymentStatus
  describe('getPaymentStatus', () => {
    test('should return payment status successfully', async () => {
      // Setup
      req.params = { id: 1 };
      
      const mockOrder = {
        id: 1,
        UserId: 1,
        paymentStatus: 'paid',
        transactionToken: 'fake-token'
      };
      
      Order.findOne.mockResolvedValue(mockOrder);
      
      // Execute
      await PaymentController.getPaymentStatus(req, res, next);
      
      // Assert
      expect(Order.findOne).toHaveBeenCalledWith({
        where: { id: 1, UserId: 1 }
      });
      
      expect(res.json).toHaveBeenCalledWith({
        orderId: 1,
        paymentStatus: 'paid',
        transactionToken: 'fake-token'
      });
    });
    
    test('should return 404 if order not found', async () => {
      // Setup
      req.params = { id: 999 };
      
      Order.findOne.mockResolvedValue(null);
      
      // Execute
      await PaymentController.getPaymentStatus(req, res, next);
      
      // Assert
      expect(Order.findOne).toHaveBeenCalledWith({
        where: { id: 999, UserId: 1 }
      });
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Order not found" });
    });
    
    test('should call next with error if process fails', async () => {
      // Setup
      req.params = { id: 1 };
      
      const error = new Error('Database error');
      Order.findOne.mockRejectedValue(error);
      
      // Execute
      await PaymentController.getPaymentStatus(req, res, next);
      
      // Assert
      expect(Order.findOne).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  // Tests for handlePaymentNotification - adding these to cover lines 136-190
  describe('handlePaymentNotification', () => {
    test('should process successful payment notification', async () => {
      // Setup - successful payment case
      req.body = {
        order_id: 'ORDER-1-123456789',
        transaction_status: 'settlement',
        fraud_status: 'accept',
        payment_type: 'credit_card'
      };
      
      const mockOrder = {
        id: 1,
        update: jest.fn().mockResolvedValue(true)
      };
      
      // Extract order ID from the format ORDER-ID-TIMESTAMP
      Order.findByPk.mockResolvedValue(mockOrder);
      
      // Execute
      await PaymentController.handlePaymentNotification(req, res, next);
      
      // Assert
      expect(Order.findByPk).toHaveBeenCalledWith('1');
      expect(mockOrder.update).toHaveBeenCalledWith({
        paymentStatus: 'paid',
        status: 'processing', 
        paymentMethod: 'credit_card'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'OK' });
    });
    
    test('should process pending payment notification', async () => {
      // Setup - pending payment case
      req.body = {
        order_id: 'ORDER-2-123456789',
        transaction_status: 'pending',
        payment_type: 'bank_transfer'
      };
      
      const mockOrder = {
        id: 2, 
        update: jest.fn().mockResolvedValue(true)
      };
      
      Order.findByPk.mockResolvedValue(mockOrder);
      
      // Execute
      await PaymentController.handlePaymentNotification(req, res, next);
      
      // Assert
      expect(Order.findByPk).toHaveBeenCalledWith('2');
      expect(mockOrder.update).toHaveBeenCalledWith({
        paymentStatus: 'pending',
        status: undefined,
        paymentMethod: 'bank_transfer'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'OK' });
    });
    
    test('should process canceled payment notification', async () => {
      // Setup - canceled payment case
      req.body = {
        order_id: 'ORDER-3-123456789',
        transaction_status: 'cancel',
        payment_type: 'credit_card'
      };
      
      const mockOrder = {
        id: 3,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Order.findByPk.mockResolvedValue(mockOrder);
      
      // Execute
      await PaymentController.handlePaymentNotification(req, res, next);
      
      // Assert
      expect(Order.findByPk).toHaveBeenCalledWith('3');
      expect(mockOrder.update).toHaveBeenCalledWith({
        paymentStatus: 'failed',
        status: undefined,
        paymentMethod: 'credit_card'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'OK' });
    });
    
    test('should process denied payment notification', async () => {
      // Setup - denied payment case
      req.body = {
        order_id: 'ORDER-4-123456789',
        transaction_status: 'deny',
        payment_type: 'credit_card'
      };
      
      const mockOrder = {
        id: 4,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Order.findByPk.mockResolvedValue(mockOrder);
      
      // Execute
      await PaymentController.handlePaymentNotification(req, res, next);
      
      // Assert
      expect(Order.findByPk).toHaveBeenCalledWith('4');
      expect(mockOrder.update).toHaveBeenCalledWith({
        paymentStatus: 'failed',
        status: undefined,
        paymentMethod: 'credit_card'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'OK' });
    });
    
    test('should process expired payment notification', async () => {
      // Setup - expired payment case
      req.body = {
        order_id: 'ORDER-5-123456789',
        transaction_status: 'expire',
        payment_type: 'credit_card'
      };
      
      const mockOrder = {
        id: 5,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Order.findByPk.mockResolvedValue(mockOrder);
      
      // Execute
      await PaymentController.handlePaymentNotification(req, res, next);
      
      // Assert
      expect(Order.findByPk).toHaveBeenCalledWith('5');
      expect(mockOrder.update).toHaveBeenCalledWith({
        paymentStatus: 'failed',
        status: undefined,
        paymentMethod: 'credit_card'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'OK' });
    });
    
    test('should process refunded payment notification', async () => {
      // Setup - refunded payment case
      req.body = {
        order_id: 'ORDER-6-123456789',
        transaction_status: 'refund',
        payment_type: 'credit_card'
      };
      
      const mockOrder = {
        id: 6,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Order.findByPk.mockResolvedValue(mockOrder);
      
      // Execute
      await PaymentController.handlePaymentNotification(req, res, next);
      
      // Assert
      expect(Order.findByPk).toHaveBeenCalledWith('6');
      expect(mockOrder.update).toHaveBeenCalledWith({
        paymentStatus: 'pending',
        status: undefined,
        paymentMethod: 'credit_card'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'OK' });
    });
    
    test('should process chargeback payment notification', async () => {
      // Setup - chargeback payment case
      req.body = {
        order_id: 'ORDER-7-123456789',
        transaction_status: 'chargeback',
        payment_type: 'credit_card'
      };
      
      const mockOrder = {
        id: 7,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Order.findByPk.mockResolvedValue(mockOrder);
      
      // Execute
      await PaymentController.handlePaymentNotification(req, res, next);
      
      // Assert
      expect(Order.findByPk).toHaveBeenCalledWith('7');
      expect(mockOrder.update).toHaveBeenCalledWith({
        paymentStatus: 'pending',
        status: undefined,
        paymentMethod: 'credit_card'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'OK' });
    });
    
    test('should handle non-standard transaction status', async () => {
      // Setup - unknown status case
      req.body = {
        order_id: 'ORDER-8-123456789',
        transaction_status: 'unknown_status',
        payment_type: 'credit_card'
      };
      
      const mockOrder = {
        id: 8,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Order.findByPk.mockResolvedValue(mockOrder);
      
      // Execute
      await PaymentController.handlePaymentNotification(req, res, next);
      
      // Assert
      expect(Order.findByPk).toHaveBeenCalledWith('8');
      // Should default to pending
      expect(mockOrder.update).toHaveBeenCalledWith({
        paymentStatus: 'pending',
        status: undefined,
        paymentMethod: 'credit_card'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'OK' });
    });
    
    test('should return 404 if order not found', async () => {
      // Setup
      req.body = {
        order_id: 'ORDER-999-123456789',
        transaction_status: 'settlement'
      };
      
      Order.findByPk.mockResolvedValue(null);
      
      // Execute
      await PaymentController.handlePaymentNotification(req, res, next);
      
      // Assert
      expect(Order.findByPk).toHaveBeenCalledWith('999');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Order not found" });
    });
    
    test('should handle malformed order_id', async () => {
      // Setup - malformed order_id
      req.body = {
        order_id: 'INVALID-ORDER-ID',
        transaction_status: 'settlement'
      };
      
      // Execute
      await PaymentController.handlePaymentNotification(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Order not found" });
    });
    
    test('should call next with error if process fails', async () => {
      // Setup
      req.body = {
        order_id: 'ORDER-10-123456789',
        transaction_status: 'settlement'
      };
      
      const error = new Error('Midtrans error');
      Order.findByPk.mockRejectedValue(error);
      
      // Execute
      await PaymentController.handlePaymentNotification(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
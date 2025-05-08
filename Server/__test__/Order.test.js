const OrderController = require('../controllers/OrderController');
const { Order, Package, Mechanic } = require('../models');

// Mock the models
jest.mock('../models', () => {
  return {
    Order: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn()
    },
    Package: {
      findByPk: jest.fn()
    },
    Mechanic: {},
    User: {}
  };
});

describe('OrderController', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      user: { id: 1 },
      params: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  // Tests for getAllOrders
  describe('getAllOrders', () => {
    test('should return all orders for a user', async () => {
      const mockOrders = [
        { id: 1, UserId: 1, status: 'pending' },
        { id: 2, UserId: 1, status: 'completed' }
      ];
      
      Order.findAll.mockResolvedValue(mockOrders);
      
      await OrderController.getAllOrders(req, res, next);
      
      expect(Order.findAll).toHaveBeenCalledWith({
        where: { UserId: 1 },
        include: [
          { model: Package },
          { model: Mechanic, attributes: ['fullName', 'phoneNumber', 'speciality'] }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });
    
    test('should call next with error if findAll fails', async () => {
      const error = new Error('Database error');
      Order.findAll.mockRejectedValue(error);
      
      await OrderController.getAllOrders(req, res, next);
      
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  // Tests for createOrder
  describe('createOrder', () => {
    test('should create a new order successfully', async () => {
      req.body = {
        description: 'Test order',
        date: '2025-05-10',
        PackageId: 1,
        MechanicId: 2
      };
      
      const mockPackage = { id: 1, price: 150000 };
      Package.findByPk.mockResolvedValue(mockPackage);
      
      const mockOrder = {
        id: 1,
        ...req.body,
        UserId: 1,
        status: 'pending',
        totalAmount: 150000,
        paymentStatus: 'unpaid'
      };
      Order.create.mockResolvedValue(mockOrder);
      
      await OrderController.createOrder(req, res, next);
      
      expect(Package.findByPk).toHaveBeenCalledWith(1);
      expect(Order.create).toHaveBeenCalledWith({
        description: 'Test order',
        status: 'pending',
        date: req.body.date,
        UserId: 1,
        PackageId: 1,
        MechanicId: 2,
        totalAmount: 150000,
        paymentStatus: 'unpaid'
      });
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order created successfully',
        data: mockOrder
      });
    });
    
    test('should return 400 if PackageId is missing', async () => {
      req.body = {
        description: 'Test order',
        date: '2025-05-10'
      };
      
      await OrderController.createOrder(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Package is required" });
    });
    
    test('should return 404 if package not found', async () => {
      req.body = {
        description: 'Test order',
        date: '2025-05-10',
        PackageId: 999
      };
      
      Package.findByPk.mockResolvedValue(null);
      
      await OrderController.createOrder(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Package not found" });
    });
    
    test('should call next with error if create fails', async () => {
      req.body = {
        description: 'Test order',
        date: '2025-05-10',
        PackageId: 1
      };
      
      const mockPackage = { id: 1, price: 150000 };
      Package.findByPk.mockResolvedValue(mockPackage);
      
      const error = new Error('Database error');
      Order.create.mockRejectedValue(error);
      
      await OrderController.createOrder(req, res, next);
      
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  // Tests for updateOrder
  describe('updateOrder', () => {
    test('should update an order successfully', async () => {
      req.params = { id: 1 };
      req.body = {
        description: 'Updated description',
        status: 'completed',
        date: '2025-05-15',
        MechanicId: 3,
        PackageId: 2
      };
      
      const mockOrder = {
        id: 1,
        UserId: 1,
        PackageId: 1,
        update: jest.fn().mockResolvedValue({ id: 1, ...req.body, UserId: 1 })
      };
      Order.findByPk.mockResolvedValue(mockOrder);
      
      const mockPackage = { id: 2, price: 200000 };
      Package.findByPk.mockResolvedValue(mockPackage);
      
      await OrderController.updateOrder(req, res, next);
      
      expect(Order.findByPk).toHaveBeenCalledWith(1);
      expect(Package.findByPk).toHaveBeenCalledWith(2);
      expect(mockOrder.update).toHaveBeenCalledWith({
        description: 'Updated description',
        status: 'completed',
        date: '2025-05-15',
        MechanicId: 3,
        PackageId: 2,
        totalAmount: 200000
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order updated successfully',
        data: mockOrder
      });
    });
    
    test('should return 404 if order not found', async () => {
      req.params = { id: 999 };
      Order.findByPk.mockResolvedValue(null);
      
      await OrderController.updateOrder(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });
    
    test('should return 403 if user not authorized', async () => {
      req.params = { id: 1 };
      const mockOrder = {
        id: 1,
        UserId: 2  // Different from req.user.id
      };
      Order.findByPk.mockResolvedValue(mockOrder);
      
      await OrderController.updateOrder(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'You are not authorized to update this order' 
      });
    });
    
    test('should call next with error if update fails', async () => {
      req.params = { id: 1 };
      const error = new Error('Database error');
      Order.findByPk.mockRejectedValue(error);
      
      await OrderController.updateOrder(req, res, next);
      
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  // Tests for completeOrder
  describe('completeOrder', () => {
    test('should mark an order as completed', async () => {
      req.params = { id: 1 };
      
      const mockOrder = {
        id: 1,
        UserId: 1,
        status: 'pending',
        update: jest.fn().mockResolvedValue({ id: 1, UserId: 1, status: 'completed' })
      };
      Order.findByPk.mockResolvedValue(mockOrder);
      
      await OrderController.completeOrder(req, res, next);
      
      expect(Order.findByPk).toHaveBeenCalledWith(1);
      expect(mockOrder.update).toHaveBeenCalledWith({ status: 'completed' });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order completed successfully',
        data: mockOrder
      });
    });
    
    test('should return 404 if order not found', async () => {
      req.params = { id: 999 };
      Order.findByPk.mockResolvedValue(null);
      
      await OrderController.completeOrder(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });
    
    test('should return 403 if user not authorized', async () => {
      req.params = { id: 1 };
      const mockOrder = {
        id: 1,
        UserId: 2  // Different from req.user.id
      };
      Order.findByPk.mockResolvedValue(mockOrder);
      
      await OrderController.completeOrder(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'You are not authorized to complete this order' 
      });
    });
    
    test('should call next with error if complete fails', async () => {
      req.params = { id: 1 };
      const error = new Error('Database error');
      Order.findByPk.mockRejectedValue(error);
      
      await OrderController.completeOrder(req, res, next);
      
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  // Tests for deleteOrder
  describe('deleteOrder', () => {
    test('should delete an order successfully', async () => {
      req.params = { id: 1 };
      
      const mockOrder = {
        id: 1,
        UserId: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };
      Order.findByPk.mockResolvedValue(mockOrder);
      
      await OrderController.deleteOrder(req, res, next);
      
      expect(Order.findByPk).toHaveBeenCalledWith(1);
      expect(mockOrder.destroy).toHaveBeenCalled();
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order deleted successfully',
        data: mockOrder
      });
    });
    
    test('should return 404 if order not found', async () => {
      req.params = { id: 999 };
      Order.findByPk.mockResolvedValue(null);
      
      await OrderController.deleteOrder(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });
    
    test('should return 403 if user not authorized', async () => {
      req.params = { id: 1 };
      const mockOrder = {
        id: 1,
        UserId: 2  // Different from req.user.id
      };
      Order.findByPk.mockResolvedValue(mockOrder);
      
      await OrderController.deleteOrder(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'You are not authorized to delete this order' 
      });
    });
    
    test('should call next with error if delete fails', async () => {
      req.params = { id: 1 };
      const error = new Error('Database error');
      Order.findByPk.mockRejectedValue(error);
      
      await OrderController.deleteOrder(req, res, next);
      
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
const { Op } = require("sequelize");
const { Order, Mechanic, User, Package } = require("../models");
const path = require("path");
const fs = require("fs").promises;


module.exports = class OrderController {
  static async getAllOrders(req, res, next) {
    try {
      const orders = await Order.findAll({
        where: { UserId: req.user.id },
        include: [
          { model: Package },
          { model: Mechanic, attributes: ['fullName', 'phoneNumber', 'speciality'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json(orders);
    } catch (error) {
      console.error("Error in getAllOrders:", error);
      next(error);
    }
  }

  static async createOrder(req, res, next) {
    try {
      const { description, date, PackageId, MechanicId } = req.body;
      const UserId = req.user.id;

      if (!PackageId) {
        return res.status(400).json({ message: "Package is required" });
      }

      // Get package details for price information
      const packageInfo = await Package.findByPk(PackageId);
      if (!packageInfo) {
        return res.status(404).json({ message: "Package not found" });
      }

      // Create order with payment details
      const newOrder = await Order.create({
        description,
        status: "pending",
        date: date || new Date(),
        UserId,
        PackageId,
        MechanicId,
        totalAmount: packageInfo.price,
        paymentStatus: "unpaid"
      });

      res.status(201).json({
        message: "Order created successfully",
        data: newOrder,
      });
    } catch (error) {
      console.error("Error in createOrder:", error);
      next(error);
    }
  }

  static async updateOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { description, status, date, MechanicId, PackageId } = req.body;

      const order = await Order.findByPk(id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.UserId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to update this order" });
      }

      // If package is changed, update the total amount
      let updateData = {
        description,
        status,
        date,
        MechanicId,
        PackageId
      };

      if (PackageId && PackageId !== order.PackageId) {
        const packageInfo = await Package.findByPk(PackageId);
        if (packageInfo) {
          updateData.totalAmount = packageInfo.price;
        }
      }

      await order.update(updateData);

      res.status(200).json({
        message: "Order updated successfully",
        data: order,
      });
    } catch (error) {
      console.error("Error in updateOrder:", error);
      next(error);
    }
  }

  static async completeOrder(req, res, next) {
    try {
      const { id } = req.params;

      const order = await Order.findByPk(id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.UserId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to complete this order" });
      }

      await order.update({ status: "completed" });

      res.status(200).json({
        message: "Order completed successfully",
        data: order,
      });
    } catch (error) {
      console.error("Error in completeOrder:", error);
      next(error);
    }
  }

  static async deleteOrder(req, res, next) {
    try {
      const { id } = req.params;

      const order = await Order.findByPk(id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.UserId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this order" });
      }

      await order.destroy();

      res.status(200).json({
        message: "Order deleted successfully",
        data: order,
      });
    } catch (error) {
      console.error("Error in deleteOrder:", error);
      next(error);
    }
  }

  
};
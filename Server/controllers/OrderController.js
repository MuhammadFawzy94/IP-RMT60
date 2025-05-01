const { Op } = require('sequelize')
const { Order, Mechanic, User, Package} = require('../models'); // Adjust the path as necessary

module.exports = class OrderController {
    static async getAllOrders(req, res, next) {
        try {
            const orders = await Order.findAll({
                include: [ 
                    {
                        model: Mechanic,
                        attributes: ['id', 'fullName'],
                    },
                    {
                        model: User,
                        attributes: ['id', 'email'],
                    },
                    {
                        model: Package,
                        attributes: ['id', 'namePackage', 'price'],
                    }
                ],
                });

            res.status(200).json(orders);
        } catch (error) {
            console.error('Error in getAllOrders:', error); // Log the error for debugging
            next(error);
        }
    }

    static async createOrder(req, res, next) {
        try {
            const { description, status, date, MechanicId, PackageId } = req.body;
            const UserId = req.user.id; // Assuming the user ID is stored in req.user

            const newOrder = await Order.create({
                description,
                status,
                date,
                UserId,
                MechanicId,
                PackageId
            });

            res.status(201).json({
                message: "Order created successfully",
                data: newOrder
            });
        } catch (error) {
            console.error('Error in createOrder:', error); // Log the error for debugging
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

            await order.update({
                description,
                status,
                date,
                MechanicId,
                PackageId
            });

            res.status(200).json({
                message: "Order updated successfully",
                data: order
            });
        } catch (error) {
            console.error('Error in updateOrder:', error); // Log the error for debugging
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

            await order.update({ status: 'completed' });

            res.status(200).json({
                message: "Order completed successfully",
                data: order
            });
        } catch (error) {
            console.error('Error in completeOrder:', error); // Log the error for debugging
            next(error);
        }
    }

    static async donePayment(req, res, next) {
        try {
            const { id } = req.params;

            const order = await Order.findByPk(id);

            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            await order.update({ status: 'donePayment' });

            res.status(200).json({
                message: "Payment done successfully",
                data: order
            });
        } catch (error) {
            console.error('Error in donePayment:', error); // Log the error for debugging
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

            await order.destroy();

            res.status(200).json({
                message: "Order deleted successfully",
                data: order
            });
        } catch (error) {
            console.error('Error in deleteOrder:', error); // Log the error for debugging
            next(error);
        }
    }

}
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');



exports.placeOrder = async (req, res, next) => {
    try {
        const { userId, shippingAddress, paymentMethod } = req.body;

        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            const error = new Error('Cannot place order with an empty cart');
            error.status = 400;
            throw error;
        }

        const orderItems = cart.items
            .filter(item => item.productId)
            .map(item => ({
                productId: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                quantity: item.quantity,
                total: item.productId.price * item.quantity
            }));

        if (orderItems.length === 0) {
            const error = new Error('No valid products found in cart');
            error.status = 400;
            throw error;
        }

        const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.08;
        const shipping = subtotal > 5000 ? 0 : 500;
        const total = subtotal + tax + shipping;

        const order = await Order.create({
            orderNumber: 'HW-' + Date.now().toString().slice(-6),
            userId,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            totals: { subtotal, tax, shipping, total },
            status: 'confirmed'
        });

        cart.items = [];
        await cart.save();

        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};



exports.getUserOrders = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const userOrders = await Order.find({ userId });

        res.json({
            success: true,
            count: userOrders.length,
            data: userOrders
        });
    } catch (err) {
        next(err);
    }
};



exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            const error = new Error(`Order with ID ${req.params.orderId} not found`);
            error.status = 404;
            throw error;
        }

        res.json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

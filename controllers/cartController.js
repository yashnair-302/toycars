const Cart = require('../models/Cart');
const Product = require('../models/Product');



exports.getCart = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        let cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            cart = { items: [] };
        }

        const enrichedItems = cart.items
            .filter(item => item.productId)
            .map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                product: item.productId
            }));

        let subtotal = 0;
        enrichedItems.forEach(item => {
            subtotal += item.product.price * item.quantity;
        });
        const tax = subtotal * 0.08;
        const shipping = subtotal > 5000 ? 0 : 500;
        const total = subtotal + tax + shipping;

        res.json({
            success: true,
            data: {
                items: enrichedItems,
                totals: { subtotal, tax, shipping, total }
            }
        });
    } catch (err) {
        next(err);
    }
};



exports.addToCart = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            const error = new Error(`Product with ID ${productId} not found`);
            error.status = 404;
            throw error;
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }

        const existingItem = cart.items.find(
            item => item.productId.toString() === productId.toString()
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();

        res.status(201).json({
            success: true,
            message: `Added ${quantity} × ${product.name} to cart`,
            data: cart.items
        });
    } catch (err) {
        next(err);
    }
};



exports.updateCartItem = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const productId = req.params.productId;
        const { quantity } = req.body;

        if (!quantity || typeof quantity !== 'number' || quantity < 1) {
            const error = new Error('Quantity must be a positive integer');
            error.status = 400;
            throw error;
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            const error = new Error('Cart not found');
            error.status = 404;
            throw error;
        }

        const item = cart.items.find(
            item => item.productId.toString() === productId.toString()
        );

        if (!item) {
            const error = new Error(`Product ${productId} not found in cart`);
            error.status = 404;
            throw error;
        }

        item.quantity = quantity;
        await cart.save();

        res.json({ success: true, data: cart.items });
    } catch (err) {
        next(err);
    }
};



exports.removeFromCart = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const productId = req.params.productId;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            const error = new Error('Cart not found');
            error.status = 404;
            throw error;
        }

        const index = cart.items.findIndex(
            item => item.productId.toString() === productId.toString()
        );

        if (index === -1) {
            const error = new Error(`Product ${productId} not found in cart`);
            error.status = 404;
            throw error;
        }

        cart.items.splice(index, 1);
        await cart.save();

        res.json({
            success: true,
            message: 'Item removed from cart',
            data: cart.items
        });
    } catch (err) {
        next(err);
    }
};

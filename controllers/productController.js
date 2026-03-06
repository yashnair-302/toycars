const Product = require('../models/Product');



exports.getAllProducts = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.category) {
            filter.category = new RegExp(`^${req.query.category}$`, 'i');
        }

        const products = await Product.find(filter);

        res.json({ success: true, count: products.length, data: products });
    } catch (err) {
        next(err);
    }
};



exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            const error = new Error(`Product with ID ${req.params.id} not found`);
            error.status = 404;
            throw error;
        }

        res.json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};



exports.createProduct = async (req, res, next) => {
    try {
        const { name, category, price, originalPrice, image, badge, description } = req.body;

        const newProduct = await Product.create({
            name: name.trim(),
            category: category.trim(),
            price,
            originalPrice: originalPrice || null,
            image: image || 'images/placeholder.png',
            badge: badge || null,
            description: description || ''
        });

        res.status(201).json({ success: true, data: newProduct });
    } catch (err) {
        next(err);
    }
};



exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            const error = new Error(`Product with ID ${req.params.id} not found`);
            error.status = 404;
            throw error;
        }

        res.json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};



exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            const error = new Error(`Product with ID ${req.params.id} not found`);
            error.status = 404;
            throw error;
        }

        res.json({ success: true, message: 'Product deleted', data: product });
    } catch (err) {
        next(err);
    }
};

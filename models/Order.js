const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    name: String,
    price: Number,
    quantity: Number,
    total: Number
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    phone: { type: String, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
        type: String,
        enum: ['card', 'paypal', 'cod'],
        required: true
    },
    totals: {
        subtotal: Number,
        tax: Number,
        shipping: Number,
        total: Number
    },
    status: {
        type: String,
        default: 'confirmed'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);

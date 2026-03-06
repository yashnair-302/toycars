const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = 3000;

mongoose.connect("mongodb://localhost:27017/hotwheels", {
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});



app.use(express.static(path.join(__dirname)));



const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);



app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'HotWheels API is running!',
        endpoints: {
            products: '/api/products',
            users: '/api/users',
            cart: '/api/cart/:userId',
            orders: '/api/orders'
        }
    });
});



app.use('/api/*', notFound);
app.use(errorHandler);



app.listen(PORT, () => {
    console.log(`\n🏎️  HotWheels Server running on http://localhost:${PORT}`);
    console.log(`📦  API available at http://localhost:${PORT}/api`);
    console.log(`🌐  Frontend at http://localhost:${PORT}/index.html\n`);
});

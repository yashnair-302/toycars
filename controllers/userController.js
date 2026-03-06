const User = require('../models/User');



exports.signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            const error = new Error('Email is already registered');
            error.status = 409;
            throw error;
        }

        const newUser = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password
        });

        const safeUser = newUser.toObject();
        delete safeUser.password;

        res.status(201).json({ success: true, data: safeUser });
    } catch (err) {
        next(err);
    }
};



exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
            password: password
        });

        if (!user) {
            const error = new Error('Invalid email or password');
            error.status = 401;
            throw error;
        }

        const safeUser = user.toObject();
        delete safeUser.password;

        res.json({ success: true, data: safeUser });
    } catch (err) {
        next(err);
    }
};



exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            const error = new Error(`User with ID ${req.params.id} not found`);
            error.status = 404;
            throw error;
        }

        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

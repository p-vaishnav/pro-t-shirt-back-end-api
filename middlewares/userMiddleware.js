const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    // for web for mobile
    const token = req.cookies.token || (req.body && req.body.token) || req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return next(new CustomError('Token does not exist, please provide a valid one'));
    }

    const data = jwt.verify(token, process.env.JWT_SECRET);

    req.user = data;

    next();

});

// this is quite amazing I really liked it.
exports.customRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            next(new CustomError('Not able to access this data!!!'));
        }
        next();
    };
};

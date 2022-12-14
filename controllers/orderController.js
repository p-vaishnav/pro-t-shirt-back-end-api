const Order = require("../models/order");
const Product = require("../models/product");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");

// lets make a controller for createOrder
exports.createOrder = BigPromise(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentIfo,
        taxAmount,
        shippingAmount,
        totalAmount
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentIfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user.id
    });

    res.status(200).json({
        success: true,
        order
    })
});

// getOneOrder
exports.getOneOrder = BigPromise(async (req, res, next) => {
    const order = await (await Order.findById(req.params.id)).populate('user', 'name email');

    if (!order) {
        return next(new CustomError('Unable to find an order'));
    }

    res.status(200).json({
        success: true,
        order
    });
});

// TODO: will complete it
exports.getLoggedInUser = BigPromise(async (req, res, next) => {
    const order = await Order.find({user: req.user.id});

    if (!order) {
        return next(new CustomError('Unable to find an order'));
    }

    res.status(200).json({
        success: true,
        order
    })
});

// get all orders
exports.getAllOrders = BigPromise(async (req, res, next) => {
    const orders = await Order.find();

    res.status(200).json({
        success: true,
        orders
    });
});

// update orders
exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new CustomError('Order id is invalid'));
    }

    if (order.orderStatus === 'Delivered') {
        return next(new CustomError('Order is delivered'));
    }

    order.orderStatus = req.body.orderStatus;

    // updating the stock of given products
    order.orderItems.forEach(async (prod) => {
        await processProducts(prod.product, prod.quantity); 
    });

    await order.save();

    res.status(200).json({
        success: true,
        order
    });
});

async function processProducts(productId, quantity) {
    const product = await Product.findById(productId);

    if (!product) {
        return next(new CustomError('Product id is invalid'));
    }

    product.stock = product.stock - quantity;
    await product.save();
}

exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    await order.remove();
    res.status(200).json({
        success: true,
        order
    });
});
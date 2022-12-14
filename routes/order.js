const express = require('express');
const router = express.Router();
const {isLoggedIn, customRole} = require('../middlewares/userMiddleware');
const {createOrder, getOneOrder, getLoggedInUser, getAllOrders, adminUpdateOrder, adminDeleteOrder} = require('../controllers/orderController');

router.route('/order/create').post(isLoggedIn, createOrder);
router.route('/order/myorder').get(isLoggedIn, getLoggedInUser);

// should be cautious with this route
router.route('/order/:id').get(isLoggedIn, customRole('admin'), getOneOrder);

// TODO: admin/orders and update admin/order/:id route
router.route('/admin/orders').get(isLoggedIn, customRole('admin'), getAllOrders);
router.route('/admin/order/:id').put(isLoggedIn, customRole('admin'), adminUpdateOrder);
router.route('/admin/order/:id').delete(isLoggedIn, customRole('admin'), adminDeleteOrder);

module.exports = router;
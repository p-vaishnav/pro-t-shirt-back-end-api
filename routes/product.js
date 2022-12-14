const express = require('express');
const router = express.Router();
const {testProduct, getAllProducts, addProduct, adminGetAllProducts, getSingleProduct, adminUpdateProduct, adminDeleteProduct, deleteReview, addReview, getReviewForAProduct} = require('../controllers/productController');
const { isLoggedIn, customRole} = require('../middlewares/userMiddleware');

// for testing
router.route('/testproduct').get(testProduct);

// admin routes
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addProduct);
router.route('/admin/products').get(isLoggedIn, customRole('admin'), adminGetAllProducts);
router.route('/admin/product/update/:id').put(isLoggedIn, customRole('admin'), adminUpdateProduct).delete(isLoggedIn, customRole('admin'), adminDeleteProduct);

// user routes
// TODO: this I will do when I am in good mood
router.route('/products').get(getAllProducts);
router.route('/product/:id').get(getSingleProduct);
// TODO: testing is remaining, do review it once I get time
router.route('/review').put(isLoggedIn, addReview);
router.route('/review').delete(isLoggedIn, deleteReview);
router.route('/reviews').get(isLoggedIn, getReviewForAProduct)

module.exports = router;
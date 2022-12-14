const express = require('express');
const router = express.Router();
const {signup, login, logout, forgotPassword, passwordReset, userDashboard, updatePassword, updateUserDetails, adminAllUsers, managerAllUsers, adminGetOneUser} = require('../controllers/userController');
const { isLoggedIn, customRole } = require('../middlewares/userMiddleware');

// all the respective routes
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotpassword').post(forgotPassword);
router.route('/password/reset/:tokenId').post(passwordReset);
router.route('/userdashboard').get(isLoggedIn, userDashboard);
router.route('/password/update').post(isLoggedIn, updatePassword);
router.route('/userdashboard/update').post(isLoggedIn, updateUserDetails);

// admin routes
router.route('/admin/users').post(isLoggedIn, customRole('admin'), adminAllUsers);
// TODO: below routes require testing
router.route('/admin/user/:id').get(isLoggedIn, customRole('admin'), adminGetOneUser);
router.route('/admin/user/:id').put(isLoggedIn, customRole('admin'), adminGetOneUser);
router.route('/admin/user/:id').delete(isLoggedIn, customRole('admin'), adminGetOneUser);

// manager routes
router.route('/manager/users').post(isLoggedIn, customRole('manager'), managerAllUsers);

module.exports = router;
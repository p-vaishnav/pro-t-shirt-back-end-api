const express = require('express');
const router = express.Router();

const {home} = require('../controllers/homeController');

router.route('/').get(home);
router.route('/dummy').get((req, res) => res.send('Success'));

module.exports = router;
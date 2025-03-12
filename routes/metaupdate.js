const express = require('express');
const userController = require('../controllers/usermetaController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.put('/update-profile', authMiddleware, userController.updateProfile);

module.exports = router;
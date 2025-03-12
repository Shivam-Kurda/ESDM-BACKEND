const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware=require('../middlewares/auth0midlleware');
const metaupdatecontroller=require('../controllers/metaUpdateController')
const fetchMetadata = require('../controllers/usermetaController')

router.post('/register', authController.registerUser);
router.post('/update-profile',  metaupdatecontroller.updateProfile)
router.get('/fetch-metadata', fetchMetadata.fetchUserMetadata)
module.exports = router;
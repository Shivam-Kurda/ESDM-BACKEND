const express = require('express');
const router = express.Router();
const productDbController=require('../controllers/productDbController');
const companyDbController=require('../controllers/companyDbController')
router.post('/add_product', productDbController.addProduct);
router.post('/add_ProductToCompany',companyDbController.addProducttoCompany)
router.get('/getAllProducts',companyDbController.getProductDetails)
router.post('/removeProduct',companyDbController.removeProductFromCompany)
module.exports=router
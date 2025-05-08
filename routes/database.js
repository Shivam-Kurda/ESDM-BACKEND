const express = require('express');
const router = express.Router();
const multer   = require('multer');
const upload   = multer({ storage: multer.memoryStorage() });
const productDbController=require('../controllers/productDbController');
const companyDbController=require('../controllers/companyDbController')
router.post('/add_product', productDbController.addProduct);
router.post('/add_ProductToCompany',companyDbController.addProducttoCompany)
router.post('/edit_ProductToCompany',companyDbController.edit_ProductToCompany)
router.get('/getAllProducts',companyDbController.getProductDetails)
router.post('/removeProduct',companyDbController.removeProductFromCompany)
router.get('/getProductList',productDbController.getProductList)
router.get('/getCompanies_Product',productDbController.getCompaniesForProduct)
router.get('/getCompanyDetails',companyDbController.getCompanyDetails)
// router.post('/addQuotationRequestToCompany',companyDbController.addQuotationRequestToCompany)
router.post(
    '/addQuotationRequestToCompany',
    upload.single('requirements'),
    companyDbController.addQuotationRequestToCompany);
router.get('/getQuotationRequests',companyDbController.getQuotationRequests)
module.exports=router
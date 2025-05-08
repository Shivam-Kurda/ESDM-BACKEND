const companyDbService=require('../services/companyDbService')
const {addProductToCompany}=companyDbService;
const {removeProductFromCompany}=companyDbService
const {getProductDetails}=companyDbService
const {getCompanyDetails}=companyDbService
const {edit_ProductToCompany}=companyDbService
const {addQuotationRequestToCompany}=companyDbService
const {getQuotationRequests}=companyDbService
const csv = require('csvtojson');
exports.addProducttoCompany=async(req,res,next) => {
    try{
        console.log(req.query.userId)
        const userId=req.query.userId
        const {
            ProductName,
            Category,
            Description,
            Specifications,
            Price,
            LeadTime,
            MinimumOrderQuantity,
            Certifications
          } = req.body;    
        console.log(req.body)
        // const ProductData={ProductName,Description,Category,Specifications};
        const ProductData = {
            ProductName: ProductName,
            Category: Category,
            Description: Description,
            Specifications: Specifications,
            Price: Price,
            LeadTime: LeadTime,
            MinimumOrderQuantity: MinimumOrderQuantity,
            Certifications: Certifications,
          };    
        await addProductToCompany(userId,ProductData)
        res.status(201).json({message:'Product added successfuly to company product list'})
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:'Error adding product to database'})
    }
}
exports.removeProductFromCompany=async(req,res,next) => {
    try{
        console.log("here")
        const userId=req.query.userId
        console.log(userId)
        const {ProductName} = req.body
        console.log(ProductName)
        await removeProductFromCompany(userId,ProductName)
        res.status(201).json({message: "Product removed from database."})
    }
    catch(error){
        console.error(error)
        res.status(500).json({message: "Error removing product from database."})
    }
}
exports.getProductDetails = async(req,res,next) => {
    try{
        const userId=req.query.userId
        const productDetails=await getProductDetails(userId)
        res.json(productDetails);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
exports.getCompanyDetails = async(req,res,next) => {
    try{
        const cin=req.query.cin
        const companyDetails=await getCompanyDetails(cin)
        // console.log(companyDetails)
        res.status(201).json(companyDetails)
    }
    catch(error){
        res.status(500).json({error:error.message})
    }
}
exports.edit_ProductToCompany = async(req,res,next) => {
    try{
        const userId=req.query.userId
        const product_to_edit=req.body.oldName
        const newdata=req.body.updatedData
        await edit_ProductToCompany(userId,product_to_edit,newdata)
        res.status(201).json({message:'Product data succesfully edited'});
    }
    catch(error){

        res.status(500).json({error:error.message});
    }
}
exports.addQuotationRequestToCompany = async (req, res, next) => {
    try {
      const userId  = req.query.userId;
      const { productName, SupplierCompany } = req.body;
  
      if (!productName || !SupplierCompany) {
        return res.status(400).json({ message: 'Missing productName / SupplierCompany' });
      }
  
      // ------------------------------------------------------------------
      // Obtain the quotation details either from an uploaded CSV OR from a
      // plain-text field called "requirements" (fallback).
      // ------------------------------------------------------------------
      let quotationDetails;
  
      if (req.file) {
        // 1️⃣  If we got a CSV file -> convert it to JSON (array of rows)
        const csvString     = req.file.buffer.toString('utf-8');
        quotationDetails   = await csv().fromString(csvString);
        console.log("CSV file received: ", quotationDetails);
  
        // If you’d rather keep the raw CSV text or a Base64 string instead
        // of a parsed array, replace the line above with:
        // quotationDetails = csvString;          // raw text
        // or quotationDetails = req.file.buffer; // Buffer (binary)
      } else if (req.body.requirements) {
        // 2️⃣  Fallback – they sent a plain textarea
        quotationDetails = req.body.requirements;
      } else {
        return res.status(400).json({ message: 'No requirements provided' });
      }
      console.log("Quotation details received: ", quotationDetails);
      await addQuotationRequestToCompany(
        userId,
        productName,
        quotationDetails,
        SupplierCompany
      );
  
      res
        .status(201)
        .json({ message: 'Quotation request added successfully to company product list' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error adding product to database' });
    }
  };
exports.getQuotationRequests = async(req,res,next) => {
    try{
        const userId=req.query.userId
        console.log(userId)
        const quotationRequests=await getQuotationRequests(userId)
        res.status(201).json(quotationRequests)
    }
    catch(error){
        res.status(500).json({error:error.message})
    }
}
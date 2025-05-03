const companyDbService=require('../services/companyDbService')
const {addProductToCompany}=companyDbService;
const {removeProductFromCompany}=companyDbService
const {getProductDetails}=companyDbService
const {getCompanyDetails}=companyDbService
const {edit_ProductToCompany}=companyDbService
const {addQuotationRequestToCompany}=companyDbService
const {getQuotationRequests}=companyDbService
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
exports.addQuotationRequestToCompany = async(req,res,next) => {
    try{
        const userId=req.query.userId
        console.log("add quotation request",userId)
        const {productName,requirements,SupplierCompany} = req.body
        console.log(userId)
        console.log(productName)
        console.log(requirements)
        await addQuotationRequestToCompany(userId,productName,requirements,SupplierCompany)
        res.status(201).json({message:'Quotation request added successfuly to company product list'})
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:'Error adding product to database'})
    }
}
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
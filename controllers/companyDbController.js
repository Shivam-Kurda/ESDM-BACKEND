const companyDbService=require('../services/companyDbService')
const {addProductToCompany}=companyDbService;
const {removeProductFromCompany}=companyDbService
const {getProductDetails}=companyDbService
exports.addProducttoCompany=async(req,res,next) => {
    try{
        console.log(req.query.userId)
        const userId=req.query.userId
        const {ProductName,Description,Category,Specifications}=req.body;
        console.log(req.body)
        const ProductData={ProductName,Description,Category,Specifications};
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
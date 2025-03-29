const productDbService=require('../services/productDbService');
const companyDbService=require('../services/companyDbService')
const {addProductToDatabase}=productDbService;
const {getProductDetails}=productDbService;
const {addProductToCompany}=companyDbService;
exports.addProduct=async(req,res,next)=>{
    try{
        const {ProductName,Description,Category,img}=req.body;
        const ProductData={ProductName,Description,Category,img};
        await addProductToDatabase(ProductData);
        res.status(201).json({message:'Product added successfully'});
    }catch(error){
        console.error(error);
        res.status(500).json({message:'Error adding product to database'});
    }
}
exports.addProducttoCompany=async(req,res,next) => {
    try{
        const {ProductName,Description,Category,img}=req.body;
        const ProductData={ProductName,Description,Category,img};
        await addProductToCompany(ProductData)
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:'Error adding product to database'})
    }
}
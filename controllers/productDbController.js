const productDbService=require('../services/productDbService');
const companyDbService=require('../services/companyDbService')
const {addProductToDatabase}=productDbService;
const {getProductDetails}=productDbService;
const {addProductToCompany}=companyDbService;
const {getProductList}=productDbService
const {getCompaniesForProduct}=productDbService
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
exports.getProductList=async(req,res,next) => {
    try{
        // console.log("ffunction called")
        const products=await getProductList()
        // console.log(products)
        res.status(201).json({products})

    }
    catch(error){
        console.error(error)
        res.status(500).json({message:'E'})
    }
}
exports.getCompaniesForProduct=async(req,res,next)=> {
    try{
        const {ProductName}=req.query
        // console.log(ProductName)
        const companies=await getCompaniesForProduct(ProductName)
        res.status(201).json(companies)
    }
    catch(error){
        console.error(error)
        res.status(500).json({message: "Error while fetching companies for the product."})
    }
    

}
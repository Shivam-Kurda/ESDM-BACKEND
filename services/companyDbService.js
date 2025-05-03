const mysql = require('mysql2/promise'); // Assuming you're using mysql2
const usermetaController=require('../controllers/usermetaController')
const { getManagementApiToken } = require('../utils/metadatautil');
const { getUserMetadata } = require('./auth0meta');
const getDbConnection=require('../utils/dbConnectionUtil');
const {getUserDetails}=require('../services/userDbService')
const productDbService=require('../services/productDbService')
const {getProductDetails}=require('../services/productDbService')
const {addProductToDatabase}=require('../services/productDbService')
const {getMongoDb}=require('../utils/mongoDatabaseUtil')
const {ObjectId}=require('mongodb')

exports.addCompanyToDatabase = async (userId) => { 
    try {

        console.log("add company to database")
        const accessToken = await getManagementApiToken();
        const userMetadata = await getUserMetadata(userId, accessToken);   
        const connection = await getDbConnection()
        const { email, country, company, companyemail, cin, taxNumber,incorporationDate,companyWebsite } = userMetadata;   
        console.log("user metadata is : ",userMetadata)
        const user_details=await getUserDetails(email)

        const companyName=company
        const user_id=user_details.user_id
        const query = `INSERT IGNORE INTO company_masters (corporate_identifier,company_name,tax_number,incorporation_date,website,email,domain_id,subdomain_id,company_type_id,company_active,company_visible,company_deleted,company_enabled,master_id,country)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
        const companyData={cin,companyName,taxNumber,incorporationDate,companyWebsite,companyemail,country}
        await addCompanyToMongo(companyData)
        values=[cin,companyName,taxNumber,incorporationDate,companyWebsite,companyemail,1,1,1,1,1,1,1,user_id,country]
        await connection.query(query,values)
        connection.release();

        
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log('Product already exists. No new entry added.');

          return { success: false, message: 'Product already exists.' };
        } else {
          // Handle other types of errors
          console.error('Error adding product to database:', error);
          throw error; // Rethrow the error to handle it in the calling function
        }
  }
}
const addCompanyToMongo = async(companyData) => {
  try{

    const db=await getMongoDb();
    const companies=db.collection('companies');
    const existingCompany = await companies.findOne({ cin: companyData.cin });
    if (existingCompany) {
      console.log('Company with this CIN already exists. Skipping insertion.');
      return;
    }

    const result = await companies.insertOne(companyData);
    console.log('Company added successfully:', result);
    return result

  }
  catch(error){
    console.error("Error inserting company data into MongoDB:", error);
  }
  
  
}
exports.getCompanySqlData = async(companyName) => {
  try{
    const connection=await getDbConnection()
    const query = `SELECT * FROM company_masters WHERE company_name = ?`;
    const [rows] = await connection.execute(query, [companyName]);
    return rows.length > 0 ? rows[0] : null; 
  }
  catch(error){
    throw error
  }
}


exports.addProductToCompany = async(userId,productData) => {
  try{
    console.log("add product to company")
    const accessToken = await getManagementApiToken();
    const userMetadata = await getUserMetadata(userId, accessToken); 
    const {company}=userMetadata
    // Get product details. (If they don't exist, first add them, then refetch.)
    const sqlconnection=await getDbConnection()
    const company_name=company
    const sql_query=`INSERT IGNORE INTO company_product_map (company_id,product_id) VALUES (?,?)`;
    const company_data=await this.getCompanySqlData(company_name)
    console.log("company data is : ",company_data)
    const company_id=company_data.company_id 
    const ProductName=productData.ProductName
    console.log("Product Name is : ",ProductName)
    let productDetails = await getProductDetails(ProductName);
    const cin=company_data.corporate_identifier
    console.log("cin is ",cin)
    if (!productDetails) {
      await addProductToDatabase(productData);
      productDetails = await getProductDetails(ProductName);
    }
    const product_id=productDetails.product_id
    await sqlconnection.execute(sql_query,[company_id,product_id]);
    // Get a MongoDB connection (make sure you are using your MongoDB utility here,
    // not a MySQL connection)
    const mongo_db= await getMongoDb();
    const companies = mongo_db.collection('companies');
    
    // Update the matching company document by matching the 'cin' field.
    // Use $push to add the product details to a 'products' array field.
    console.log("Product data is : ", productData)
    const updateResult = await companies.updateOne(
      { 
        cin: cin, 
        products: { 
          $elemMatch: { 
            ProductName: { $regex: new RegExp(`^${productData.ProductName.trim()}$`, 'i') } 
          } 
        } // Ensure exact match in the array
      },
      { 
        $set: { "products.$": productData } // Update the existing product
      }
    );
    
    // If no product was updated, check if the exact product already exists before adding.
    if (updateResult.modifiedCount === 0) {
      const existingProduct = await companies.findOne(
        { 
          cin: cin, 
          products: { 
            $elemMatch: { 
              ProductName: { $regex: new RegExp(`^${productData.ProductName.trim()}$`, 'i') } 
            } 
          }  // Check if an identical product exists
        }
      );
    
      if (!existingProduct) { // Only add if no identical product exists
        await companies.updateOne(
          { cin: cin },
          { $push: { products: productData } } // Add new product
        );
      }
    }
    
  
    
    console.log('Update Result:', updateResult);
    
    return updateResult;
  }
  catch(error){ 
    
   
    
      // console.error(error)
      // res.status(500).json({ message: error.response.data.message });
      throw error
    
    
  }
  
    
  
}
exports.removeProductFromCompany=async(userId,ProductName)=>{
  try {
    // Step 1: Get Management API Token & User Metadata
    const accessToken = await getManagementApiToken();
    
    const userMetadata = await getUserMetadata(userId, accessToken);
    console.log(userMetadata)
    const { company } = userMetadata;
    
    // Step 2: Get Company Data from MySQL
    const sqlconnection = await getDbConnection();
    const companyData = await this.getCompanySqlData(company);
    if (!companyData) {
        throw new Error("Company not found.");
    }

    const company_id = companyData.company_id;
    const cin = companyData.corporate_identifier;
    console.log("Removing product:", ProductName, "from company:", company);

    // Step 3: Get Product Details
    const productDetails = await getProductDetails(ProductName);
    if (!productDetails) {
        throw new Error("Product not found in database.");
    }
    const product_id = productDetails.product_id;

    // Step 4: Remove product from MySQL `company_product_map`
    const sql_query = `DELETE FROM company_product_map WHERE company_id = ? AND product_id = ?`;
    const [result] = await sqlconnection.execute(sql_query, [company_id, product_id]);
    console.log("MySQL Deletion Result:", result);

    // Step 5: Remove product from MongoDB `companies` collection
    const mongo_db = await getMongoDb();
    const companies = mongo_db.collection('companies');
    const updateResult = await companies.updateOne(
        { cin: cin }, 
        { $pull: { products: { ProductName: { $regex: new RegExp(`^${ProductName.trim()}$`, 'i') } } } }
    );

    console.log("MongoDB Update Result:", updateResult);

    return {
        message: "Product removed successfully from company databases",
        mysqlResult: result,
        mongoResult: updateResult
    };

  } 
  catch (error) {
    console.error("Error removing product:", error);
    throw error;
  }
}
exports.getProductDetails = async (userId) => {
  try {
      // Step 1: Get Management API Token & User Metadata
      const accessToken = await getManagementApiToken();
      const userMetadata = await getUserMetadata(userId, accessToken);
      const { company } = userMetadata;

      // Step 2: Get Company Data from MySQL
      const companyData = await this.getCompanySqlData(company);
      if (!companyData) {
          throw new Error("Company not found.");
      }
      const cin = companyData.corporate_identifier; // Unique identifier for MongoDB
      // Step 3: Fetch Company Document from MongoDB
      const mongo_db = await getMongoDb();
      const companies = mongo_db.collection('companies');
      const companyDocument = await companies.findOne(
          { cin: cin }, 
          { projection: { products: 1, _id: 0 } } // Fetch only 'products' field
      );

      if (!companyDocument) {
          throw new Error("Company document not found in MongoDB.");
      }

      return companyDocument.products || [];

  } catch (error) {
      console.error("Error fetching company products:", error);
      throw error;
  }
};

exports.getCompanyDetails = async(cin) => {
  try{
    const mongo_db=await getMongoDb();
    const company_collection=mongo_db.collection('companies');
  
    console.log(cin)
    const company=company_collection.findOne({ cin: { $regex: new RegExp(`^${cin}$`, 'i') } });


    return company
  }
  catch(error){
    throw error;
  }
}
exports.edit_ProductToCompany=async(userId,product_to_edit,newData) => {
  try{
    const accessToken = await getManagementApiToken();
    const userMetadata = await getUserMetadata(userId, accessToken); 
    const {company}=userMetadata
    // Get product details. (If they don't exist, first add them, then refetch.)
    console.log("edit products to company");
    const company_name=company
    const company_data=await this.getCompanySqlData(company_name)
    const cin=company_data.corporate_identifier
    const mongo_db = await getMongoDb();
    const companies = mongo_db.collection('companies');
    const updateResult = await companies.updateOne(
      { 
        cin: cin, 
        products: { 
          $elemMatch: { 
            ProductName: { $regex: new RegExp(`^${product_to_edit.trim()}$`, 'i') } 
          } 
        } // Ensure exact match in the array
      },
      { 
        $set: { "products.$": newData } // Update the existing product
      }
    );
    console.log(updateResult)

  }
  catch(error){
    console.log(error)
    throw error
  }
};
exports.addQuotationRequestToCompany = async(userId,ProductName,RequestDetails,SupplierCompany) => {
  try{
    const accessToken = await getManagementApiToken();
    const userMetadata = await getUserMetadata(userId, accessToken); 
    const {company}=userMetadata
    const requesting_company_name=company
    const requesting_company_data=await this.getCompanySqlData(requesting_company_name)
    const requesting_cin=requesting_company_data.corporate_identifier

    const suplpier_company_data=await this.getCompanySqlData(SupplierCompany)
    const supplier_cin=suplpier_company_data.corporate_identifier
    const mongo_db=await getMongoDb()
    const companies=mongo_db.collection('companies')

    // Update the request details in the MongoDb collection in supplier company
    const updateResult_supplier = await companies.updateOne(
      { cin: supplier_cin },
      {
        $push: {
          quotation_requests_received: {
            productName: ProductName,
            quotationDetails: RequestDetails,
            requestingCompany: requesting_company_name // You must pass this from your backend
          }
        }
      }
    );
    
    // Add quotation request to requesting company's "quotation_requests_sent"
    const updateResult_requesting = await companies.updateOne(
      { cin: requesting_cin },
      {
        $push: {
          quotation_requests_sent: {
            productName: ProductName,
            quotationDetails: RequestDetails,
            supplierCompany: SupplierCompany 
          }
        }
      }
    );
    
    console.log('Supplier Company Update Result:', updateResult_supplier);
    console.log('Requesting Company Update Result:', updateResult_requesting);
    

  }
  catch(error){
    console.log(error)
    throw error
  }
}
exports.getQuotationRequests = async(userId) => {
  try{
    const accessToken = await getManagementApiToken();
    const userMetadata = await getUserMetadata(userId, accessToken); 
    const {company}=userMetadata
    const company_name=company
    const company_data=await this.getCompanySqlData(company_name)
    const cin=company_data.corporate_identifier
    const mongo_db=await getMongoDb()
    const companies=mongo_db.collection('companies')
    const company_details=await companies.findOne({ cin:cin })
    const sent_requests=company_details.quotation_requests_sent
    const received_requests=company_details.quotation_requests_received
    const all_requests={
      sent_requests,
      received_requests
    }
    console.log(all_requests)
    return all_requests
  }
  catch(error){
    console.log(error)
    throw error
  }
}
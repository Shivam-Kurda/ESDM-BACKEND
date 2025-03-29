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
        const accessToken = await getManagementApiToken();
        const userMetadata = await getUserMetadata(userId, accessToken);   
        const connection = await getDbConnection()
        const { email, country, company, companyemail, cin, taxNumber,incorporationDate,companyWebsite } = userMetadata;   
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
    console.log(ProductName)
    const productDetails = await getProductDetails(ProductName);
    const cin=company_data.corporate_identifier
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
    
    console.log("cin is ",cin)
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


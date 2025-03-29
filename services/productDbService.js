const mysql = require('mysql2/promise'); // Assuming you're using mysql2
const getDbConnection=require('../utils/dbConnectionUtil');
exports.addProductToDatabase = async (ProductData) => {
    const { ProductName, Description , Category, img } = ProductData;
  
    const query = `
      INSERT INTO product_masters (product_name)
      VALUES (?)
    `;
  
    const values = [ProductName];
  
    try {
        const connection = getDbConnection();
        await connection.query(query, values);
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

exports.getProductDetails = async(ProductName) => { 
      const query=`SELECT * FROM product_masters WHERE product_name = ? `
      const values = [ProductName]
      console.log(values)
      try{
        const connection = await getDbConnection();
        const [rows] = await connection.execute(query, values);
        return rows.length > 0 ? rows[0] : null; 

      }
      catch(error){
        // console.error(error)
        // res.status(500).json({ message: error.response.data.message });
        throw error
      }
}
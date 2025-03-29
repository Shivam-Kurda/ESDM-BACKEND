const mysql = require('mysql2/promise');
const getDbConnection = async() => {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD
      });
    try {
    const connection = await pool.getConnection();
    return connection;
    } catch (error) {
    console.error('Error getting a MySQL connection:', error);
    throw error;
    }
}

module.exports=getDbConnection;
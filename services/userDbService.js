const getDbConnection=require('../utils/dbConnectionUtil');
const bcrypt = require('bcrypt');
const ip = require('ip'); // To get the actual IP address
const addUserToDatabase = async (userData) => {
 
  connection=await getDbConnection()
  

   
  const { email, password, country, company, firstname, lastname , registrationIp, registrationTime } = userData;

  const query = `
    INSERT INTO user_masters (user_name,email,user_password,registration_ip,registration_time,user_visible,user_deleted,user_active,user_enabled)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  try {
    // 1️⃣ Combine first name and last name
    const user_name = `${firstname} ${lastname}`.trim();

    // 2️⃣ Convert plaintext password to varbinary (hash using bcrypt)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Convert registration IP (handle local IP case)
    const realIp = registrationIp === '::1' ? ip.address() : registrationIp;
    const ipBuffer = Buffer.from(realIp);

    // 4️⃣ Convert registration time to MySQL DATETIME format
    const formattedTime = new Date(registrationTime).toISOString().slice(0, 19).replace('T', ' ');

    // 5️⃣ Default values for other fields
    const user_visible = 1;
    const user_deleted = 0;
    const user_active = 1;
    const user_enabled = 1;

    const query = `
      INSERT INTO user_masters 
      (user_name, email, user_password, registration_ip, registration_time, user_visible, user_deleted, user_active, user_enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [user_name, email, hashedPassword, ipBuffer, formattedTime, user_visible, user_deleted, user_active, user_enabled];

    await connection.query(query, values);
    // console.log('User registered successfully:', result);
    // return { success: true, userId: result.insertId };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  } finally {
    await connection.release();
  }
}
const getUserDetails=async(email) => {
  console.log("User email for the company is : ",email)
  const connection=await getDbConnection()
  try {
    const query = `SELECT * FROM user_masters WHERE email = ?`;
    const [rows] = await connection.execute(query, [email]);
    return rows.length > 0 ? rows[0] : null; 
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  } finally {
    await connection.release(); // Close the connection
  }
}
module.exports={addUserToDatabase,getUserDetails}
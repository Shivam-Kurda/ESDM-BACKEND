const auth0Service = require('../services/auth0Service');
const userDbService=require('../services/userDbService')
const getDbConnection=require('../utils/dbConnectionUtil')
exports.registerUser = async (req, res, next) => {
  const { email, password,  country, company,firstname,lastname } = req.body;
  console.log(email, password, country, company,firstname,lastname);
  
  if (!email || !password || !country || !company || !firstname || !lastname) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  const connection=await getDbConnection()
  try {
    const registrationIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(registrationIp);
    const registrationTime=new Date().toISOString()
    const userData = { email, password, country, company, firstname, lastname , registrationIp, registrationTime };
    
    // const auth0user=await auth0Service.createUser(userData);
    // console.log(auth0user);
    await userDbService.addUserToDatabase(userData)
    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
    console.log("Registration successful. Please check your email to verify your account.");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.response.data.message });
    console.log("Registration unsuccessful. Please try again.");
  }
};
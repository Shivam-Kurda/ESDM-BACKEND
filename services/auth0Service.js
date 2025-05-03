const axios = require('axios');
const getAuth0Token = require('../utils/getAuth0Token');

exports.createUser = async (userData) => {
  const token = await getAuth0Token();

  const response = await axios.post(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
    {
      email: userData.email,
      password: userData.password,
      connection: 'Username-Password-Authentication',
      user_metadata: {
        email:userData.email,
        country:userData.country,
        company:userData.company,
        firstname:userData.firstname,
        lastname:userData.lastname,
        registrationIp:userData.registrationIp,
        registrationTime:userData.registrationTime

      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};
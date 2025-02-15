const axios = require('axios');

const getAuth0Token = async () => {
  const response = await axios.post(
    `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.access_token;
};

module.exports = getAuth0Token;
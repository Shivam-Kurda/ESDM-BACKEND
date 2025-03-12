const fetch = require('node-fetch');

const fetchWithAuth = async (url, accessToken) => {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const getManagementApiToken = async () => {
  const domain = process.env.AUTH0_DOMAIN;
  const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${domain}/api/v2/`,
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  return data.access_token;
};

module.exports = { fetchWithAuth, getManagementApiToken };
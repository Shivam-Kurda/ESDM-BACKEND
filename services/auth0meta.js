const { fetchWithAuth } = require('../utils/metadatautil');

const getUserMetadata = async (userId, accessToken) => {
  const domain = process.env.AUTH0_DOMAIN;
  const userDetailsByIdUrl = `https://${domain}/api/v2/users/${userId}`;

  const response = await fetchWithAuth(userDetailsByIdUrl, accessToken);
  const { user_metadata } = await response.json();
  return user_metadata;
};

module.exports = { getUserMetadata };
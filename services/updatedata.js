const { default: axios } = require("axios");
const { getManagementApiToken } = require('../utils/metadatautil');
async function updateUserMetadata(userId, metadata) {
    const token = await getManagementApiToken();
    console.log(token)
    try {
      const response = await axios.patch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
        { user_metadata: metadata },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      throw new Error(`Failed to update user metadata: ${error.message}`);
    }
  }
module.exports = {
    updateUserMetadata,
};
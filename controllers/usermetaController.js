const { getUserMetadata } = require('../services/auth0meta');
const { getManagementApiToken } = require('../utils/metadatautil');

const fetchUserMetadata = async (req, res) => {
  try {
    
    const userId = req.query.userId;
    console.log(userId)
    const accessToken = await getManagementApiToken();

    const userMetadata = await getUserMetadata(userId, accessToken);
    res.json(userMetadata);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { fetchUserMetadata };
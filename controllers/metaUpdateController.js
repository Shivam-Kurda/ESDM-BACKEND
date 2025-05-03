const userService = require('../services/updatedata');
const companyDbService=require('../services/companyDbService')
async function updateProfile(req, res) {
  const userId = req.query.userId; // Assuming user ID is available in req.user
  const metadata = req.body;
  console.log("meta data update profile")
  try {
    const updatedUser = await userService.updateUserMetadata(userId, metadata);
    await companyDbService.addCompanyToDatabase(userId)
    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  updateProfile,
};
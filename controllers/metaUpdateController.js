const userService = require('../services/updatedata');

async function updateProfile(req, res) {
  const userId = req.query.userId; // Assuming user ID is available in req.user
  const metadata = req.body;
  console.log(userId)

  console.log(metadata)
  try {
    const updatedUser = await userService.updateUserMetadata(userId, metadata);
    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  updateProfile,
};
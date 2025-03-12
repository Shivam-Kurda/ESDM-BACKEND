function authMiddleware(req, res, next) {
    // Example: Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  }
  
  module.exports = authMiddleware;
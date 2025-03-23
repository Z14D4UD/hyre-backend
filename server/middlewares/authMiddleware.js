// server/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  let token = req.header('x-auth-token');
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.accountType = decoded.accountType;
    if (decoded.accountType === 'customer') {
      req.customer = { id: decoded.id };
    }
    // Add other account types if needed
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

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
    // You can also set req.business or req.affiliate for other account types
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// server/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.accountType = decoded.accountType;
    if (decoded.accountType === 'business') {
      req.business = { id: decoded.id };
    } else if (decoded.accountType === 'customer') {
      req.customer = { id: decoded.id };
    } else if (decoded.accountType === 'affiliate') {
      req.affiliate = { id: decoded.id };
    }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

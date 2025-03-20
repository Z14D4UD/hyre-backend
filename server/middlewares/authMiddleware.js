// server/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // First, try to get the token from the custom header
  let token = req.header('x-auth-token');
  
  // If not found, check for the standard Authorization header
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7, authHeader.length).trim();
    }
  }
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Set the accountType on the request object
    req.accountType = decoded.accountType;
    
    // Depending on accountType, attach the user id to the corresponding property
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

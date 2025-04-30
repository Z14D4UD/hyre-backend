// server/middlewares/adminMiddleware.js

module.exports = function (req, res, next) {
    // authMiddleware already ran and set req.accountType
    if (req.accountType !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }
    next();
  };
  
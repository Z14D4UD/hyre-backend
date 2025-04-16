// server/middlewares/uploadMiddleware.js
const multer = require('multer');
const path   = require('path');

// write into server/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  cb(null, file.mimetype.startsWith('image/'));
};

module.exports = multer({ storage, fileFilter });

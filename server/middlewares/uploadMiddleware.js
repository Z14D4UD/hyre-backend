// server/middlewares/uploadMiddleware.js
const multer = require('multer');
const path   = require('path');

// must point at the *same* uploads folder
const uploadsDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// accept only images
const fileFilter = (_req, file, cb) => {
  cb(null, file.mimetype.startsWith('image/'));
};

module.exports = multer({ storage, fileFilter });

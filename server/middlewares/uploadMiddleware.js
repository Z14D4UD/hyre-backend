// uploadMiddleware.js
const multer = require('multer');
const path   = require('path');

// store in same uploads folder under project
const uploadsDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (_req, file, cb) => cb(null, file.mimetype.startsWith('image/'));

module.exports = multer({ storage, fileFilter });
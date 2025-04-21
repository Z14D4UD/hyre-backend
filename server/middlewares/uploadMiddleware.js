// server/middlewares/uploadMiddleware.js
const multer = require('multer');
const path   = require('path');

// <project‑root>/server/uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (_req, file, cb) =>
  cb(null, file.mimetype.startsWith('image/')); // only images

module.exports = multer({ storage, fileFilter });

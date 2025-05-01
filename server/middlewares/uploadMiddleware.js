// server/middlewares/uploadMiddleware.js
const multer = require('multer');
const path   = require('path');

// Store directly on Render’s persistent disk:
const uploadsDir = path.join('/data','uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (_req, file, cb) =>
  cb(null, file.mimetype.startsWith('image/'));

module.exports = multer({ storage, fileFilter });

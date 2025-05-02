// server/middlewares/uploadMiddleware.js
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// must match the uploadsDir in server.js
const uploadsDir = path.join(__dirname, '..', 'uploads');

// ensure it exists (harmless if it already does)
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// accept only image mime types
const fileFilter = (_req, file, cb) =>
  cb(null, file.mimetype.startsWith('image/'));

module.exports = multer({ storage, fileFilter });

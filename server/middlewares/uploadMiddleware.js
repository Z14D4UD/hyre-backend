// server/middlewares/uploadMiddleware.js
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Use the same uploads folder inside your project
const uploadsDir = path.join(__dirname, '..', 'uploads');
// Ensure it exists (should already from server.js, but safe to double-check)
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (_req, file, cb) =>
  cb(null, file.mimetype.startsWith('image/'));

module.exports = multer({ storage, fileFilter });

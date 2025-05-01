// server/middlewares/uploadMiddleware.js
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

/**
 * Files go to the Render persistent disk:
 *   Mount path    →  /data
 *   Our sub-folder → /data/uploads
 */
const uploadsDir = '/data/uploads';

// create the directory the first time the service starts
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb)  => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (_req, file, cb) =>
  cb(null, file.mimetype.startsWith('image/'));   // accept only images

module.exports = multer({ storage, fileFilter });

// server/middlewares/uploadMiddleware.js
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

/**
 * Render mounts the persistent disk at /data and creates it for you.
 * We store all files in /data/uploads.
 */
const uploadsDir = '/data/uploads';

/* ------------------------------------------------------------
 *  If /data/uploads is missing we’ll try to create it,      
 *  but ignore EACCES (not permitted) because that just means
 *  the directory already exists and is owned by root.
 * ---------------------------------------------------------- */
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  /* ignore permission-denied – the folder is there already */
  if (err.code !== 'EACCES') throw err;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb)  => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (_req, file, cb) =>
  cb(null, file.mimetype.startsWith('image/'));  // accept only images

module.exports = multer({ storage, fileFilter });

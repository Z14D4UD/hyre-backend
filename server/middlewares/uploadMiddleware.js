const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

/**
 * In development, store to ./uploads (relative to project root);
 * in production (Render), use the mounted /mnt/data volume.
 */
const localUploads = path.join(__dirname, '..', 'uploads');
const prodUploads  = '/mnt/data';
const uploadsDir   = process.env.NODE_ENV === 'production' ? prodUploads : localUploads;

// Ensure local folder exists in dev
if (process.env.NODE_ENV !== 'production') {
  if (!fs.existsSync(localUploads)) {
    fs.mkdirSync(localUploads, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (_req, file, cb) =>
  cb(null, file.mimetype.startsWith('image/'));  // only accept images

module.exports = multer({ storage, fileFilter });

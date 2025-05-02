const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Must match the uploadsDir above:
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure it exists (only needed in dev, but harmless in prod):
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// Accept only images:
const fileFilter = (_req, file, cb) =>
  cb(null, file.mimetype.startsWith('image/'));

module.exports = multer({ storage, fileFilter });

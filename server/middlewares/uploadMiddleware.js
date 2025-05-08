// server/middlewares/uploadMiddleware.js
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// storage directory must match server.js uploadsDir
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename:    (_req, file, cb) => {
    // preserve extension
    const ext  = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext)
                    .replace(/\s+/g, '-')
                    .replace(/[^a-zA-Z0-9-_]/g, '');
    cb(null, `${Date.now()}-${name}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  cb(null, file.mimetype.startsWith('image/'));
};

module.exports = multer({ storage, fileFilter });
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { RESUME_ALLOWED_TYPES, RESUME_MAX_SIZE_MB } = require('../config/constants');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let sub = 'misc';
    if (file.fieldname === 'resume') sub = 'resumes';
    if (file.fieldname === 'coverLetter') sub = 'cover-letters';
    if (file.fieldname === 'logo') sub = 'logos';
    if (file.fieldname === 'avatar') sub = 'avatars';
    const dir = path.join(__dirname, '..', 'uploads', sub);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${req.user ? req.user._id : 'anon'}-${Date.now()}${ext}`;
    cb(null, unique);
  }
});

const resumeFileFilter = (req, file, cb) => {
  if (['resume', 'coverLetter'].includes(file.fieldname)) {
    if (!RESUME_ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error('Only PDF, DOC and DOCX files are allowed'));
    }
  }
  if (['logo', 'avatar'].includes(file.fieldname)) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter: resumeFileFilter,
  limits: { fileSize: RESUME_MAX_SIZE_MB * 1024 * 1024 }
});

module.exports = upload;

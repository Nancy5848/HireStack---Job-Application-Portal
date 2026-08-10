const express = require('express');
const {
  getMyCompany,
  updateMyCompany,
  uploadLogo,
  addGalleryImage,
  getCompanyById
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.get('/profile', protect, authorize(ROLES.RECRUITER), getMyCompany);
router.put('/profile', protect, authorize(ROLES.RECRUITER), updateMyCompany);
router.post('/logo', protect, authorize(ROLES.RECRUITER), upload.single('logo'), uploadLogo);
router.post('/gallery', protect, authorize(ROLES.RECRUITER), addGalleryImage);
router.get('/:id', getCompanyById);

module.exports = router;

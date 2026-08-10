const express = require('express');
const { createReview, getCompanyReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.post('/:companyId', protect, authorize(ROLES.STUDENT), createReview);
router.get('/:companyId', getCompanyReviews);

module.exports = router;

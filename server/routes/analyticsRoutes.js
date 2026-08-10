const express = require('express');
const { getRecruiterAnalytics, getStudentAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.get('/recruiter', protect, authorize(ROLES.RECRUITER), getRecruiterAnalytics);
router.get('/student', protect, authorize(ROLES.STUDENT), getStudentAnalytics);

module.exports = router;

const express = require('express');
const {
  applyToJob,
  getMyApplications,
  withdrawApplication,
  getJobApplicants,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.post('/:jobId', protect, authorize(ROLES.STUDENT), applyToJob);
router.get('/mine', protect, authorize(ROLES.STUDENT), getMyApplications);
router.put('/:id/withdraw', protect, authorize(ROLES.STUDENT), withdrawApplication);
router.get('/job/:jobId', protect, authorize(ROLES.RECRUITER), getJobApplicants);
router.put('/:id/status', protect, authorize(ROLES.RECRUITER), updateApplicationStatus);

module.exports = router;

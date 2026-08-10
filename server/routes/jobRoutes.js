const express = require('express');
const {
  createJob,
  updateJob,
  deleteJob,
  getJobs,
  getFeaturedJobs,
  getJobById,
  getRecruiterJobs
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.get('/', getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/recruiter/mine', protect, authorize(ROLES.RECRUITER), getRecruiterJobs);
router.get('/:id', getJobById);
router.post('/', protect, authorize(ROLES.RECRUITER), createJob);
router.put('/:id', protect, authorize(ROLES.RECRUITER), updateJob);
router.delete('/:id', protect, authorize(ROLES.RECRUITER), deleteJob);

module.exports = router;

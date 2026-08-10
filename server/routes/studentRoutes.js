const express = require('express');
const {
  getMyProfile,
  getStudentById,
  updateMyProfile,
  uploadResume,
  downloadMyResume,
  downloadStudentResume,
  uploadCoverLetter,
  getResumeScore,
  toggleSaveJob,
  getSavedJobs
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.get('/profile', protect, authorize(ROLES.STUDENT), getMyProfile);
router.put('/profile', protect, authorize(ROLES.STUDENT), updateMyProfile);
router.post('/resume', protect, authorize(ROLES.STUDENT), upload.single('resume'), uploadResume);
router.get('/resume/download', protect, authorize(ROLES.STUDENT), downloadMyResume);
router.post('/cover-letter', protect, authorize(ROLES.STUDENT), upload.single('coverLetter'), uploadCoverLetter);
router.get('/resume-score', protect, authorize(ROLES.STUDENT), getResumeScore);
router.post('/saved-jobs/:jobId', protect, authorize(ROLES.STUDENT), toggleSaveJob);
router.get('/saved-jobs', protect, authorize(ROLES.STUDENT), getSavedJobs);
router.get('/:id/resume/download', protect, authorize(ROLES.RECRUITER), downloadStudentResume);
router.get('/:id', getStudentById);

module.exports = router;

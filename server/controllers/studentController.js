const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @route  GET /api/students/profile   (student, own profile)
const getMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate('user', 'name email avatar');
  if (!student) throw new ApiError(404, 'Student profile not found');
  res.status(200).json({ success: true, student });
});

// @route  GET /api/students/:id   (public - view a student's public profile)
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate('user', 'name email avatar');
  if (!student) throw new ApiError(404, 'Student not found');
  res.status(200).json({ success: true, student });
});

// @route  PUT /api/students/profile   (student)
const updateMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) throw new ApiError(404, 'Student profile not found');

  const allowedFields = [
    'headline',
    'bio',
    'phone',
    'location',
    'skills',
    'languages',
    'education',
    'experience',
    'projects',
    'certificates',
    'socialLinks'
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) student[field] = req.body[field];
  });

  student.calculateCompletion();
  await student.save();

  res.status(200).json({ success: true, student });
});

// @route  POST /api/students/resume   (student)
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No resume file uploaded');

  const student = await Student.findOne({ user: req.user._id });
  if (!student) throw new ApiError(404, 'Student profile not found');

  if (student.resume && student.resume.filePath && fs.existsSync(student.resume.filePath)) {
    fs.unlinkSync(student.resume.filePath);
  }

  student.resume = {
    fileName: req.file.originalname,
    filePath: req.file.path,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    uploadedAt: new Date()
  };
  student.calculateCompletion();
  await student.save();

  res.status(200).json({ success: true, resume: student.resume, profileCompletion: student.profileCompletion });
});

// @route  GET /api/students/resume/download   (student, own resume)
const downloadMyResume = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student || !student.resume?.filePath) throw new ApiError(404, 'No resume uploaded');
  res.download(student.resume.filePath, student.resume.fileName);
});

// @route  GET /api/students/:id/resume/download   (recruiter - view applicant resume)
const downloadStudentResume = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student || !student.resume?.filePath) throw new ApiError(404, 'No resume uploaded for this candidate');
  res.download(student.resume.filePath, student.resume.fileName);
});

// @route  POST /api/students/cover-letter   (student)
const uploadCoverLetter = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No cover letter file uploaded');
  const student = await Student.findOne({ user: req.user._id });
  if (!student) throw new ApiError(404, 'Student profile not found');

  student.coverLetter = {
    fileName: req.file.originalname,
    filePath: req.file.path,
    uploadedAt: new Date()
  };
  await student.save();
  res.status(200).json({ success: true, coverLetter: student.coverLetter });
});

// @route  GET /api/students/resume-score   (student)
const getResumeScore = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) throw new ApiError(404, 'Student profile not found');

  const percentage = student.calculateCompletion();
  await student.save();

  const suggestions = [];
  if (!student.skills || student.skills.length === 0) suggestions.push('Add your skills');
  if (!student.experience || student.experience.length === 0) suggestions.push('Add work experience');
  if (!student.resume || !student.resume.filePath) suggestions.push('Upload your resume');
  if (!student.education || student.education.length === 0) suggestions.push('Complete your education details');
  if (!student.projects || student.projects.length === 0) suggestions.push('Add at least one project');
  if (!student.bio) suggestions.push('Write a short bio');

  res.status(200).json({ success: true, percentage, suggestions });
});

// @route  POST /api/students/saved-jobs/:jobId   (student, toggle save)
const toggleSaveJob = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) throw new ApiError(404, 'Student profile not found');

  const jobId = req.params.jobId;
  const idx = student.savedJobs.findIndex((id) => id.toString() === jobId);

  if (idx > -1) {
    student.savedJobs.splice(idx, 1);
    await student.save();
    return res.status(200).json({ success: true, saved: false, message: 'Job removed from saved list' });
  }

  student.savedJobs.push(jobId);
  await student.save();
  res.status(200).json({ success: true, saved: true, message: 'Job saved' });
});

// @route  GET /api/students/saved-jobs   (student)
const getSavedJobs = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate({
    path: 'savedJobs',
    populate: { path: 'company', select: 'name logo' }
  });
  if (!student) throw new ApiError(404, 'Student profile not found');
  res.status(200).json({ success: true, savedJobs: student.savedJobs });
});

module.exports = {
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
};

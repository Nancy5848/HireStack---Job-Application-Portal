const Application = require('../models/Application');
const Job = require('../models/Job');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { APPLICATION_STATUS, NOTIFICATION_TYPES } = require('../config/constants');

const calculateSkillMatch = (studentSkills = [], jobSkills = []) => {
  if (!jobSkills.length) return 0;
  const normalizedStudent = studentSkills.map((s) => s.toLowerCase().trim());
  const normalizedJob = jobSkills.map((s) => s.toLowerCase().trim());
  const matched = normalizedJob.filter((skill) => normalizedStudent.includes(skill));
  return Math.round((matched.length / normalizedJob.length) * 100);
};

// @route  POST /api/applications/:jobId   (student)
const applyToJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job || !job.isActive) throw new ApiError(404, 'Job not found or no longer active');

  const student = await Student.findOne({ user: req.user._id });
  if (!student) throw new ApiError(404, 'Student profile not found');
  if (!student.resume || !student.resume.filePath) {
    throw new ApiError(400, 'Please upload a resume before applying');
  }

  const existing = await Application.findOne({ job: job._id, student: student._id });
  if (existing) throw new ApiError(409, 'You have already applied to this job');

  const skillMatchPercentage = calculateSkillMatch(student.skills, job.requiredSkills);

  const application = await Application.create({
    job: job._id,
    student: student._id,
    recruiter: job.recruiter,
    resumeSnapshot: { fileName: student.resume.fileName, filePath: student.resume.filePath },
    coverLetterSnapshot: student.coverLetter?.filePath
      ? { fileName: student.coverLetter.fileName, filePath: student.coverLetter.filePath }
      : undefined,
    skillMatchPercentage,
    timeline: [{ status: APPLICATION_STATUS.APPLIED, note: 'Application submitted' }]
  });

  job.applicationsCount += 1;
  await job.save();

  await Notification.create({
    user: job.recruiter,
    type: NOTIFICATION_TYPES.NEW_APPLICATION,
    message: `New application received for ${job.title}`,
    link: `/recruiter/jobs/${job._id}/applicants`,
    relatedJob: job._id,
    relatedApplication: application._id
  });

  res.status(201).json({ success: true, application });
});

// @route  GET /api/applications/mine   (student)
const getMyApplications = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) throw new ApiError(404, 'Student profile not found');

  const applications = await Application.find({ student: student._id })
    .populate({ path: 'job', populate: { path: 'company', select: 'name logo' } })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: applications.length, applications });
});

// @route  PUT /api/applications/:id/withdraw   (student)
const withdrawApplication = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, 'Application not found');
  if (application.student.toString() !== student._id.toString()) {
    throw new ApiError(403, 'Not authorized to withdraw this application');
  }
  application.status = APPLICATION_STATUS.WITHDRAWN;
  application.timeline.push({ status: APPLICATION_STATUS.WITHDRAWN, note: 'Withdrawn by candidate' });
  await application.save();
  res.status(200).json({ success: true, application });
});

// @route  GET /api/applications/job/:jobId   (recruiter, owner only)
const getJobApplicants = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.recruiter.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to view applicants for this job');
  }

  const applications = await Application.find({ job: job._id })
    .populate({ path: 'student', populate: { path: 'user', select: 'name email avatar' } })
    .sort({ skillMatchPercentage: -1, createdAt: -1 });

  res.status(200).json({ success: true, count: applications.length, applications });
});

// @route  PUT /api/applications/:id/status   (recruiter, owner only)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!Object.values(APPLICATION_STATUS).includes(status)) {
    throw new ApiError(400, 'Invalid application status');
  }

  const application = await Application.findById(req.params.id).populate('job');
  if (!application) throw new ApiError(404, 'Application not found');
  if (application.recruiter.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this application');
  }

  application.status = status;
  application.timeline.push({ status, note });
  await application.save();

  const student = await Student.findById(application.student);

  let notifType = null;
  if (status === APPLICATION_STATUS.SELECTED) notifType = NOTIFICATION_TYPES.APPLICATION_ACCEPTED;
  if (status === APPLICATION_STATUS.REJECTED) notifType = NOTIFICATION_TYPES.APPLICATION_REJECTED;
  if (status === APPLICATION_STATUS.SHORTLISTED) notifType = NOTIFICATION_TYPES.APPLICATION_SHORTLISTED;

  if (notifType && student) {
    await Notification.create({
      user: student.user,
      type: notifType,
      message: `Your application for ${application.job.title} was updated to "${status}"`,
      link: `/student/applications`,
      relatedJob: application.job._id,
      relatedApplication: application._id
    });
  }

  res.status(200).json({ success: true, application });
});

module.exports = {
  applyToJob,
  getMyApplications,
  withdrawApplication,
  getJobApplicants,
  updateApplicationStatus,
  calculateSkillMatch
};

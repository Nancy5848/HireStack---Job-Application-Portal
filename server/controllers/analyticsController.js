const Job = require('../models/Job');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');
const { APPLICATION_STATUS } = require('../config/constants');

// @route  GET /api/analytics/recruiter   (recruiter)
const getRecruiterAnalytics = asyncHandler(async (req, res) => {
  const recruiterId = req.user._id;

  const [jobsPosted, totalApplications, statusBreakdown, monthlyHiring] = await Promise.all([
    Job.countDocuments({ recruiter: recruiterId }),
    Application.countDocuments({ recruiter: recruiterId }),
    Application.aggregate([
      { $match: { recruiter: recruiterId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Application.aggregate([
      { $match: { recruiter: recruiterId, status: APPLICATION_STATUS.SELECTED } },
      {
        $group: {
          _id: { year: { $year: '$updatedAt' }, month: { $month: '$updatedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);

  const selectedCount = statusBreakdown.find((s) => s._id === APPLICATION_STATUS.SELECTED)?.count || 0;
  const acceptanceRate = totalApplications > 0 ? Math.round((selectedCount / totalApplications) * 100) : 0;

  res.status(200).json({
    success: true,
    jobsPosted,
    totalApplications,
    acceptanceRate,
    statusBreakdown,
    monthlyHiring
  });
});

// @route  GET /api/analytics/student   (student)
const getStudentAnalytics = asyncHandler(async (req, res) => {
  const Student = require('../models/Student');
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const applications = await Application.find({ student: student._id });
  const interviews = applications.filter((a) => a.status === APPLICATION_STATUS.INTERVIEW).length;

  res.status(200).json({
    success: true,
    jobsApplied: applications.length,
    interviews,
    savedJobs: student.savedJobs.length,
    profileCompletion: student.profileCompletion
  });
});

module.exports = { getRecruiterAnalytics, getStudentAnalytics };

const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @route  POST /api/jobs   (recruiter)
const createJob = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ recruiter: req.user._id });
  if (!company) throw new ApiError(400, 'Please complete your company profile before posting a job');

  const job = await Job.create({ ...req.body, recruiter: req.user._id, company: company._id });
  res.status(201).json({ success: true, job });
});

// @route  PUT /api/jobs/:id   (recruiter, owner only)
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.recruiter.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to edit this job');
  }
  Object.assign(job, req.body);
  await job.save();
  res.status(200).json({ success: true, job });
});

// @route  DELETE /api/jobs/:id   (recruiter, owner only)
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.recruiter.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this job');
  }
  await job.deleteOne();
  res.status(200).json({ success: true, message: 'Job deleted successfully' });
});

// @route  GET /api/jobs   (public - search/filter/sort/paginate)
const getJobs = asyncHandler(async (req, res) => {
  const {
    keyword,
    location,
    category,
    jobType,
    experienceLevel,
    isRemote,
    salaryMin,
    salaryMax,
    sort,
    page = 1,
    limit = 12
  } = req.query;

  const filter = { isActive: true };

  if (keyword) filter.$text = { $search: keyword };
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (category) filter.category = { $regex: category, $options: 'i' };
  if (jobType) filter.jobType = jobType;
  if (experienceLevel) filter.experienceLevel = experienceLevel;
  if (isRemote !== undefined) filter.isRemote = isRemote === 'true';
  if (salaryMin || salaryMax) {
    filter.salaryMax = {};
    if (salaryMin) filter.salaryMax.$gte = Number(salaryMin);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'salary-high') sortOption = { salaryMax: -1 };
  if (sort === 'salary-low') sortOption = { salaryMin: 1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Number(limit), 50);
  const skip = (pageNum - 1) * limitNum;

  const [jobs, total] = await Promise.all([
    Job.find(filter).populate('company', 'name logo industry').sort(sortOption).skip(skip).limit(limitNum),
    Job.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    count: jobs.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    jobs
  });
});

// @route  GET /api/jobs/featured   (public)
const getFeaturedJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ isActive: true, isFeatured: true })
    .populate('company', 'name logo')
    .sort({ createdAt: -1 })
    .limit(6);
  res.status(200).json({ success: true, jobs });
});

// @route  GET /api/jobs/:id   (public)
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate(
    'company',
    'name logo industry description website headquarters'
  );
  if (!job) throw new ApiError(404, 'Job not found');
  res.status(200).json({ success: true, job });
});

// @route  GET /api/jobs/recruiter/mine   (recruiter)
const getRecruiterJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: jobs.length, jobs });
});

module.exports = { createJob, updateJob, deleteJob, getJobs, getFeaturedJobs, getJobById, getRecruiterJobs };

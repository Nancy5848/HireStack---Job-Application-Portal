const Review = require('../models/Review');
const Student = require('../models/Student');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @route  POST /api/reviews/:companyId   (student)
const createReview = asyncHandler(async (req, res) => {
  const { rating, title, comment, isAnonymous } = req.body;
  if (!rating) throw new ApiError(400, 'Rating is required');

  const student = await Student.findOne({ user: req.user._id });
  if (!student) throw new ApiError(404, 'Student profile not found');

  const existing = await Review.findOne({ company: req.params.companyId, student: student._id });
  if (existing) throw new ApiError(409, 'You have already reviewed this company');

  const review = await Review.create({
    company: req.params.companyId,
    student: student._id,
    rating,
    title,
    comment,
    isAnonymous: !!isAnonymous
  });

  res.status(201).json({ success: true, review });
});

// @route  GET /api/reviews/:companyId   (public)
const getCompanyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ company: req.params.companyId })
    .populate({ path: 'student', populate: { path: 'user', select: 'name avatar' } })
    .sort({ createdAt: -1 });

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const sanitized = reviews.map((r) => ({
    _id: r._id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    createdAt: r.createdAt,
    reviewer: r.isAnonymous ? 'Anonymous' : r.student?.user?.name || 'Anonymous'
  }));

  res.status(200).json({ success: true, count: reviews.length, avgRating, reviews: sanitized });
});

module.exports = { createReview, getCompanyReviews };

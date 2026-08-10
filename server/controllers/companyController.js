const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @route  GET /api/companies/profile   (recruiter, own company)
const getMyCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ recruiter: req.user._id });
  if (!company) throw new ApiError(404, 'Company profile not found');
  res.status(200).json({ success: true, company });
});

// @route  PUT /api/companies/profile   (recruiter)
const updateMyCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ recruiter: req.user._id });
  if (!company) throw new ApiError(404, 'Company profile not found');

  const allowedFields = [
    'name',
    'website',
    'industry',
    'companySize',
    'foundedYear',
    'headquarters',
    'description',
    'socialLinks'
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) company[field] = req.body[field];
  });

  await company.save();
  res.status(200).json({ success: true, company });
});

// @route  POST /api/companies/logo   (recruiter)
const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No logo file uploaded');
  const company = await Company.findOne({ recruiter: req.user._id });
  if (!company) throw new ApiError(404, 'Company profile not found');
  company.logo = `/uploads/logos/${req.file.filename}`;
  await company.save();
  res.status(200).json({ success: true, logo: company.logo });
});

// @route  POST /api/companies/gallery   (recruiter)
const addGalleryImage = asyncHandler(async (req, res) => {
  const { url, caption, category } = req.body;
  if (!url) throw new ApiError(400, 'Image URL is required');
  const company = await Company.findOne({ recruiter: req.user._id });
  if (!company) throw new ApiError(404, 'Company profile not found');
  company.gallery.push({ url, caption, category });
  await company.save();
  res.status(201).json({ success: true, gallery: company.gallery });
});

// @route  GET /api/companies/:id   (public)
const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new ApiError(404, 'Company not found');
  res.status(200).json({ success: true, company });
});

module.exports = { getMyCompany, updateMyCompany, uploadLogo, addGalleryImage, getCompanyById };

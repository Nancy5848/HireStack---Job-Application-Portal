const crypto = require('crypto');
const validator = require('validator');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../config/constants');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateToken();

  const cookieDays = Number(process.env.JWT_COOKIE_EXPIRES_DAYS) || 7;
  const cookieOptions = {
    expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: user.toSafeObject()
    });
};

// @route  POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyName } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, 'Name, email, password and role are required');
  }

  if (!validator.isEmail(email)) {
    throw new ApiError(400, 'Please provide a valid email address');
  }

  if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })) {
    throw new ApiError(400, 'Password must be at least 8 characters and include upper, lower case letters and a number');
  }

  if (![ROLES.STUDENT, ROLES.RECRUITER].includes(role)) {
    throw new ApiError(400, 'Role must be either student or recruiter');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password, role });

  if (role === ROLES.STUDENT) {
    await Student.create({ user: user._id });
  } else {
    await Company.create({
      recruiter: user._id,
      name: companyName || `${name}'s Company`
    });
  }

  sendTokenResponse(user, 201, res);
});

// @route  POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = user.generateToken();
  const cookieDays = rememberMe ? 30 : Number(process.env.JWT_COOKIE_EXPIRES_DAYS) || 7;

  res
    .status(200)
    .cookie('token', token, {
      expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    .json({
      success: true,
      token,
      user: user.toSafeObject()
    });
});

// @route  POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @route  GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});

// @route  POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });

  // Always respond the same way to avoid leaking which emails are registered
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent'
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // Email-ready architecture: this is where Nodemailer would send resetToken via email.
  // See services/emailService.js for the placeholder integration point.

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a reset link has been sent',
    devOnlyResetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
  });
});

// @route  POST /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Reset token is invalid or has expired');
  }

  const { password } = req.body;
  if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })) {
    throw new ApiError(400, 'Password must be at least 8 characters and include upper, lower case letters and a number');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword };

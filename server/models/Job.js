const mongoose = require('mongoose');
const { JOB_TYPES, EXPERIENCE_LEVELS } = require('../config/constants');

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    responsibilities: [String],
    requiredSkills: [{ type: String, trim: true }],
    category: { type: String, trim: true },
    location: { type: String, trim: true, required: true },
    jobType: {
      type: String,
      enum: JOB_TYPES,
      required: true
    },
    experienceLevel: {
      type: String,
      enum: EXPERIENCE_LEVELS,
      required: true
    },
    salaryMin: Number,
    salaryMax: Number,
    salaryCurrency: { type: String, default: 'INR' },
    isRemote: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    applicationDeadline: Date,
    views: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });
jobSchema.index({ location: 1, jobType: 1, experienceLevel: 1, isActive: 1 });

module.exports = mongoose.model('Job', jobSchema);

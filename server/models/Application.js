const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../config/constants');

const timelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS)
    },
    note: String,
    changedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resumeSnapshot: {
      fileName: String,
      filePath: String
    },
    coverLetterSnapshot: {
      fileName: String,
      filePath: String
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED
    },
    skillMatchPercentage: { type: Number, default: 0 },
    timeline: [timelineEventSchema]
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

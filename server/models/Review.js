const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: { type: String, maxlength: 100 },
    comment: { type: String, maxlength: 1000 },
    isAnonymous: { type: Boolean, default: false }
  },
  { timestamps: true }
);

reviewSchema.index({ company: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

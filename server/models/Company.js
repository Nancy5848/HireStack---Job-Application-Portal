const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    logo: { type: String, default: '' },
    website: String,
    industry: String,
    companySize: String,
    foundedYear: Number,
    headquarters: String,
    description: { type: String, maxlength: 2000 },
    gallery: [
      {
        url: String,
        caption: String,
        category: { type: String, enum: ['office', 'culture', 'benefits'], default: 'office' }
      }
    ],
    socialLinks: {
      linkedin: String,
      twitter: String,
      instagram: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);

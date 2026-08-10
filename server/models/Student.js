const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startYear: Number,
    endYear: Number,
    grade: String
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    company: String,
    title: String,
    startDate: Date,
    endDate: Date,
    currentlyWorking: { type: Boolean, default: false },
    description: String
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    techStack: [String],
    link: String
  },
  { _id: true }
);

const certificateSchema = new mongoose.Schema(
  {
    title: String,
    issuer: String,
    year: Number,
    link: String
  },
  { _id: true }
);

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    headline: { type: String, maxlength: 120, default: '' },
    bio: { type: String, maxlength: 600, default: '' },
    phone: String,
    location: String,
    skills: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    certificates: [certificateSchema],
    resume: {
      fileName: String,
      filePath: String,
      fileType: String,
      fileSize: Number,
      uploadedAt: Date
    },
    coverLetter: {
      fileName: String,
      filePath: String,
      uploadedAt: Date
    },
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String
    },
    profileCompletion: { type: Number, default: 0 },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
  },
  { timestamps: true }
);

studentSchema.methods.calculateCompletion = function calculateCompletion() {
  const checks = [
    !!this.headline,
    !!this.bio,
    !!this.phone,
    !!this.location,
    this.skills && this.skills.length > 0,
    this.education && this.education.length > 0,
    this.experience && this.experience.length > 0,
    this.projects && this.projects.length > 0,
    !!(this.resume && this.resume.filePath),
    !!(this.socialLinks && (this.socialLinks.linkedin || this.socialLinks.github))
  ];
  const completed = checks.filter(Boolean).length;
  const percentage = Math.round((completed / checks.length) * 100);
  this.profileCompletion = percentage;
  return percentage;
};

module.exports = mongoose.model('Student', studentSchema);

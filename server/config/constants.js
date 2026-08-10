module.exports = {
  ROLES: {
    STUDENT: 'student',
    RECRUITER: 'recruiter'
  },
  JOB_TYPES: ['Full Time', 'Part Time', 'Internship', 'Remote', 'Hybrid'],
  EXPERIENCE_LEVELS: ['Fresher', '0-1 Years', '1-3 Years', '3-5 Years', '5+ Years'],
  APPLICATION_STATUS: {
    APPLIED: 'Applied',
    VIEWED: 'Viewed',
    SHORTLISTED: 'Shortlisted',
    INTERVIEW: 'Interview',
    SELECTED: 'Selected',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn'
  },
  RESUME_ALLOWED_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  RESUME_MAX_SIZE_MB: Number(process.env.MAX_RESUME_SIZE_MB) || 5,
  NOTIFICATION_TYPES: {
    APPLICATION_ACCEPTED: 'Application Accepted',
    APPLICATION_REJECTED: 'Application Rejected',
    APPLICATION_SHORTLISTED: 'Application Shortlisted',
    NEW_JOB_POSTED: 'New Job Posted',
    NEW_APPLICATION: 'New Application'
  }
};

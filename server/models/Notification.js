const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: String,
    isRead: { type: Boolean, default: false },
    relatedJob: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    relatedApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' }
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

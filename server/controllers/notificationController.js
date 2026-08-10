const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @route  GET /api/notifications   (any authenticated user)
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.status(200).json({ success: true, notifications, unreadCount });
});

// @route  PUT /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new ApiError(404, 'Notification not found');
  if (notification.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }
  notification.isRead = true;
  await notification.save();
  res.status(200).json({ success: true, notification });
});

// @route  PUT /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead };

const express = require("express");
const authenticate = require("../../middleware/auth-middleware");
const {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllUserNotifications,
  bulkCreateNotifications,
} = require("../../controllers/notification-controller");

const router = express.Router();

// Apply authentication middleware to all notification routes
router.use(authenticate);

// Test route to verify notification system is working
router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Notification system is working!", 
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Create a new notification
router.post("/create", createNotification);

// Get notifications for a specific user
router.get("/user/:userId", getUserNotifications);

// Mark a specific notification as read
router.put("/read/:notificationId", markNotificationAsRead);

// Mark all notifications as read for a user
router.put("/read-all/:userId", markAllNotificationsAsRead);

// Delete a specific notification
router.delete("/:notificationId", deleteNotification);

// Delete all notifications for a user
router.delete("/user/:userId", deleteAllUserNotifications);

// Bulk create notifications (for system-wide notifications)
router.post("/bulk-create", bulkCreateNotifications);

module.exports = router;

const Notification = require("../../models/Notification");

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { userId, userType, type, title, message, data, priority } = req.body;

    console.log('=== CREATE NOTIFICATION ===');
    console.log('Request body:', { userId, userType, type, title, message, data, priority });
    console.log('Authenticated user:', req.user);
    console.log('Request headers:', req.headers);

    // Validate required fields
    if (!userId || !userType || !type || !title || !message) {
      console.log('Missing required fields:', { userId, userType, type, title, message });
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, userType, type, title, message",
      });
    }

    const notification = new Notification({
      userId,
      userType,
      type,
      title,
      message,
      data: data || {},
      priority: priority || 'medium'
    });

    console.log('Notification object created:', notification);

    const savedNotification = await notification.save();
    console.log('Notification saved successfully:', savedNotification._id);

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: savedNotification,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create notification",
    });
  }
};

// Get notifications for a specific user
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    console.log('=== GET USER NOTIFICATIONS ===');
    console.log('Request params:', { userId, page, limit, unreadOnly });
    console.log('Authenticated user:', req.user);
    console.log('Request headers:', req.headers);

    const skip = (page - 1) * limit;
    
    let query = { userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    console.log('MongoDB query:', query);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    console.log('Found notifications:', notifications.length);
    console.log('Total count:', total);
    console.log('Unread count:', unreadCount);
    console.log('First notification:', notifications[0]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      },
    });
  } catch (error) {
    console.error("Get user notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

// Delete all notifications for a user
const deleteAllUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Notification.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications deleted successfully`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    console.error("Delete all user notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notifications",
    });
  }
};

// Bulk create notifications (for system-wide notifications)
const bulkCreateNotifications = async (req, res) => {
  try {
    const { notifications } = req.body;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Notifications array is required and must not be empty",
      });
    }

    const createdNotifications = await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `${createdNotifications.length} notifications created successfully`,
      data: createdNotifications,
    });
  } catch (error) {
    console.error("Bulk create notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create notifications",
    });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllUserNotifications,
  bulkCreateNotifications,
};

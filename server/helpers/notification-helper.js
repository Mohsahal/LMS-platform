const Notification = require("../models/Notification");

// Helper function to create notifications automatically
class NotificationHelper {
  // Create payment completion notification
  static async createPaymentNotification(userId, userType, paymentData) {
    try {
      const notification = new Notification({
        userId,
        userType,
        type: 'payment',
        title: 'Payment Completed Successfully!',
        message: `Your payment of $${paymentData.amount} for ${paymentData.courseTitle} has been processed successfully.`,
        data: {
          paymentId: paymentData.paymentId,
          amount: paymentData.amount,
          courseId: paymentData.courseId,
          courseTitle: paymentData.courseTitle,
          timestamp: new Date()
        },
        priority: 'high'
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating payment notification:', error);
      return null;
    }
  }

  // Create course enrollment notification
  static async createEnrollmentNotification(userId, userType, enrollmentData) {
    try {
      const notification = new Notification({
        userId,
        userType,
        title: 'Course Enrollment Successful!',
        message: `You have been successfully enrolled in "${enrollmentData.courseTitle}". Start learning now!`,
        type: 'enrollment',
        data: {
          courseId: enrollmentData.courseId,
          courseTitle: enrollmentData.courseTitle,
          enrollmentDate: new Date(),
          instructorName: enrollmentData.instructorName
        },
        priority: 'high'
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating enrollment notification:', error);
      return null;
    }
  }

  // Create course completion notification
  static async createCompletionNotification(userId, userType, completionData) {
    try {
      const notification = new Notification({
        userId,
        userType,
        title: 'Course Completed! 🎉',
        message: `Congratulations! You have successfully completed "${completionData.courseTitle}". Your certificate is ready!`,
        type: 'course_completion',
        data: {
          courseId: completionData.courseId,
          courseTitle: completionData.courseTitle,
          completionDate: new Date(),
          score: completionData.score,
          certificateUrl: completionData.certificateUrl
        },
        priority: 'high'
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating completion notification:', error);
      return null;
    }
  }

  // Create course published notification for instructor
  static async createCoursePublishedNotification(userId, userType, courseData) {
    try {
      // Validate required fields
      if (!userId || !userType) {
        console.error('Missing required fields for course published notification:', { userId, userType });
        return null;
      }

      const notification = new Notification({
        userId,
        userType,
        title: 'Course Published Successfully!',
        message: `Your course "${courseData.title}" has been published and is now available to students.`,
        type: 'course_published',
        data: {
          courseId: courseData.courseId,
          courseTitle: courseData.title,
          publishDate: new Date(),
          courseUrl: courseData.courseUrl
        },
        priority: 'medium'
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating course published notification:', error);
      return null;
    }
  }

  // Create system notification
  static async createSystemNotification(userId, userType, systemData) {
    try {
      // Validate required fields
      if (!userId || !userType) {
        console.error('Missing required fields for system notification:', { userId, userType });
        return null;
      }

      const notification = new Notification({
        userId,
        userType,
        title: systemData.title || 'System Notification',
        message: systemData.message,
        type: 'system',
        data: {
          ...systemData.data,
          timestamp: new Date()
        },
        priority: systemData.priority || 'medium'
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating system notification:', error);
      return null;
    }
  }

  // Create achievement notification
  static async createAchievementNotification(userId, userType, achievementData) {
    try {
      const notification = new Notification({
        userId,
        userType,
        title: 'Achievement Unlocked! 🏆',
        message: `Congratulations! You've earned "${achievementData.title}" - ${achievementData.description}`,
        type: 'achievement',
        data: {
          achievementId: achievementData.achievementId,
          title: achievementData.title,
          description: achievementData.description,
          icon: achievementData.icon,
          unlockedDate: new Date()
        },
        priority: 'high'
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating achievement notification:', error);
      return null;
    }
  }

  // Bulk create notifications for multiple users
  static async bulkCreateNotifications(notificationsData) {
    try {
      const notifications = notificationsData.map(data => new Notification(data));
      const savedNotifications = await Notification.insertMany(notifications);
      return savedNotifications;
    } catch (error) {
      console.error('Error bulk creating notifications:', error);
      return [];
    }
  }

  // Clean up expired notifications
  static async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      }
      
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      return 0;
    }
  }

  // Create achievement notification for course milestones
  static async createCourseMilestoneNotification(userId, userType, milestoneData) {
    try {
      const notification = new Notification({
        userId,
        userType,
        title: milestoneData.title,
        message: milestoneData.message,
        type: 'achievement',
        data: {
          courseId: milestoneData.courseId,
          courseTitle: milestoneData.courseTitle,
          milestone: milestoneData.milestone,
          completedLectures: milestoneData.completedLectures,
          totalLectures: milestoneData.totalLectures,
          milestoneDate: new Date()
        },
        priority: 'medium'
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating course milestone notification:', error);
      return null;
    }
  }

  // Create system maintenance notification
  static async createMaintenanceNotification(userIds, userType, maintenanceData) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        userType,
        title: 'System Maintenance Notice',
        message: maintenanceData.message,
        type: 'system',
        data: {
          maintenanceType: maintenanceData.type,
          scheduledDate: maintenanceData.scheduledDate,
          estimatedDuration: maintenanceData.estimatedDuration,
          affectedServices: maintenanceData.affectedServices
        },
        priority: maintenanceData.priority || 'medium'
      }));

      const createdNotifications = await Notification.insertMany(notifications);
      return createdNotifications;
    } catch (error) {
      console.error('Error creating maintenance notifications:', error);
      return [];
    }
  }

  // Get notification statistics for a user
  static async getUserNotificationStats(userId) {
    try {
      const totalNotifications = await Notification.countDocuments({ userId });
      const unreadNotifications = await Notification.countDocuments({ userId, isRead: false });
      const recentNotifications = await Notification.countDocuments({ 
        userId, 
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });

      return {
        total: totalNotifications,
        unread: unreadNotifications,
        recent: recentNotifications,
        readPercentage: totalNotifications > 0 ? Math.round(((totalNotifications - unreadNotifications) / totalNotifications) * 100) : 0
      };
    } catch (error) {
      console.error('Error getting user notification stats:', error);
      return { total: 0, unread: 0, recent: 0, readPercentage: 0 };
    }
  }
}

module.exports = NotificationHelper;

const CourseProgress = require("../../models/CourseProgress");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");
const NotificationHelper = require("../../helpers/notification-helper");

//mark current lecture as viewed
const markCurrentLectureAsViewed = async (req, res) => {
  try {
    const { userId, courseId, lectureId } = req.body;

    let progress = await CourseProgress.findOne({ userId, courseId });
    const isFirstTimeWatching = !progress;
    
    if (!progress) {
      progress = new CourseProgress({
        userId,
        courseId,
        lecturesProgress: [
          {
            lectureId,
            viewed: true,
            dateViewed: new Date(),
          },
        ],
      });
      await progress.save();
      
      // Create first lecture notification to encourage engagement
      try {
        const course = await Course.findById(courseId);
        if (course) {
          await NotificationHelper.createSystemNotification(
            userId,
            'student',
            {
              title: 'Learning Journey Started! 🚀',
              message: `Welcome to "${course.title}"! You've taken the first step in your learning journey. Keep going!`,
              data: {
                courseId: courseId,
                courseTitle: course.title,
                firstLectureDate: new Date(),
                totalLectures: course.curriculum.length
              },
              priority: 'medium'
            }
          );
        }
      } catch (notificationError) {
        console.error('First lecture notification creation failed:', notificationError);
      }
    } else {
      const lectureProgress = progress.lecturesProgress.find(
        (item) => item.lectureId === lectureId
      );

      if (lectureProgress) {
        lectureProgress.viewed = true;
        lectureProgress.dateViewed = new Date();
      } else {
        progress.lecturesProgress.push({
          lectureId,
          viewed: true,
          dateViewed: new Date(),
        });
      }
      await progress.save();
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    //check all the lectures are viewed or not
    const allLecturesViewed =
      progress.lecturesProgress.length === course.curriculum.length &&
      progress.lecturesProgress.every((item) => item.viewed);

    if (allLecturesViewed && !progress.completed) {
      progress.completed = true;
      progress.completionDate = new Date();

      await progress.save();

      // Create course completion notification
      try {
        await NotificationHelper.createCompletionNotification(
          userId,
          'student',
          {
            courseId: courseId,
            courseTitle: course.title,
            score: 100, // Assuming 100% completion
            certificateUrl: `/certificates/${courseId}/${userId}` // Placeholder URL
          }
        );

        // Also notify instructor about student completion
        if (course.instructorId) {
          await NotificationHelper.createSystemNotification(
            course.instructorId,
            'instructor',
            {
              title: 'Student Course Completion! 🎉',
              message: `Congratulations! A student has completed your course "${course.title}".`,
              data: {
                courseId: courseId,
                courseTitle: course.title,
                studentId: userId,
                completionDate: new Date()
              },
              priority: 'medium'
            }
          );
        }
      } catch (notificationError) {
        // Log notification error but don't fail the progress update
        console.error('Completion notification creation failed:', notificationError);
      }
    }

    // Create lecture viewed notification (only for new lectures, not repeated views)
    const isNewLecture = !progress.lecturesProgress.find(
      (item) => item.lectureId === lectureId && item.dateViewed
    );
    
    if (isNewLecture && !isFirstTimeWatching) {
      try {
        // Find the lecture title
        const lecture = course.curriculum.find(l => l._id?.toString() === lectureId || l.title === lectureId);
        const lectureTitle = lecture?.title || 'Lecture';
        
        await NotificationHelper.createSystemNotification(
          userId,
          'student',
          {
            title: 'Lecture Progress! 📚',
            message: `Great job! You've watched "${lectureTitle}" in "${course.title}". Keep up the good work!`,
            data: {
              courseId: courseId,
              courseTitle: course.title,
              lectureId: lectureId,
              lectureTitle: lectureTitle,
              watchedDate: new Date(),
              progressPercentage: Math.round((progress.lecturesProgress.length / course.curriculum.length) * 100)
            },
            priority: 'low'
          }
        );
        
        // Check for progress milestones
        const progressPercentage = Math.round((progress.lecturesProgress.length / course.curriculum.length) * 100);
        const milestones = [25, 50, 75];
        
        if (milestones.includes(progressPercentage)) {
          let milestoneMessage = '';
          let milestoneTitle = '';
          
          switch (progressPercentage) {
            case 25:
              milestoneTitle = 'Quarter Way There! 🎯';
              milestoneMessage = `You've completed 25% of "${course.title}". You're making great progress!`;
              break;
            case 50:
              milestoneTitle = 'Halfway There! 🎉';
              milestoneMessage = `Congratulations! You've completed 50% of "${course.title}". You're doing amazing!`;
              break;
            case 75:
              milestoneTitle = 'Almost There! 🚀';
              milestoneMessage = `Fantastic! You've completed 75% of "${course.title}". The finish line is in sight!`;
              break;
          }
          
          if (milestoneMessage) {
            await NotificationHelper.createSystemNotification(
              userId,
              'student',
              {
                title: milestoneTitle,
                message: milestoneMessage,
                data: {
                  courseId: courseId,
                  courseTitle: course.title,
                  milestone: progressPercentage,
                  completedLectures: progress.lecturesProgress.length,
                  totalLectures: course.curriculum.length,
                  milestoneDate: new Date()
                },
                priority: 'medium'
              }
            );
          }
        }
      } catch (notificationError) {
        console.error('Lecture progress notification creation failed:', notificationError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Lecture marked as viewed",
      data: progress,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

//get current course progress
const getCurrentCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const studentPurchasedCourses = await StudentCourses.findOne({ userId });

    const isCurrentCoursePurchasedByCurrentUserOrNot =
      studentPurchasedCourses?.courses?.findIndex(
        (item) => item.courseId === courseId
      ) > -1;

    if (!isCurrentCoursePurchasedByCurrentUserOrNot) {
      return res.status(200).json({
        success: true,
        data: {
          isPurchased: false,
        },
        message: "You need to purchase this course to access it.",
      });
    }

    const currentUserCourseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    });

    if (
      !currentUserCourseProgress ||
      currentUserCourseProgress?.lecturesProgress?.length === 0
    ) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "No progress found, you can start watching the course",
        data: {
          courseDetails: course,
          progress: [],
          isPurchased: true,
        },
      });
    }

    const courseDetails = await Course.findById(courseId);

    res.status(200).json({
      success: true,
      data: {
        courseDetails,
        progress: currentUserCourseProgress.lecturesProgress,
        completed: currentUserCourseProgress.completed,
        completionDate: currentUserCourseProgress.completionDate,
        isPurchased: true,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

//reset course progress

const resetCurrentCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found!",
      });
    }

    progress.lecturesProgress = [];
    progress.completed = false;
    progress.completionDate = null;

    await progress.save();

    res.status(200).json({
      success: true,
      message: "Course progress has been reset",
      data: progress,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  markCurrentLectureAsViewed,
  getCurrentCourseProgress,
  resetCurrentCourseProgress,
};

const express = require("express");
const authenticate = require("../../middleware/auth-middleware");
const { upsertCourseQuiz, getCourseQuiz, listQuizSubmissions } = require("../../controllers/instructor-controller/quiz-controller");

const router = express.Router();

router.use(authenticate);

router.post("/:courseId", upsertCourseQuiz);
router.get("/:courseId", getCourseQuiz);
router.get("/:courseId/submissions", listQuizSubmissions);

module.exports = router;



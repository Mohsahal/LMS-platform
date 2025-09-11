const mongoose = require("mongoose");

const LectureSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
  public_id: String,
  freePreview: Boolean,
});

const CourseSchema = new mongoose.Schema({
  instructorId: String,
  instructorName: String,

  date: Date,
  title: String,
  category: String,
  level: String,
  primaryLanguage: String,
  subtitle: String,
  description: String,
  image: String,
  welcomeMessage: String,
  pricing: Number,
  objectives: String,
  // certificate settings
  certificateEnabled: Boolean,
  certificateTemplateUrl: String, // optional remote/background image
  certificateIssuer: { type: String, default: "Chief Executive Officer" },
  certificateOrganization: { type: String, default: "BRAVYNEX ENGINEERING" },
  certificateGradeEnabled: { type: Boolean, default: false },
  certificateCourseName: String, // optional custom course name to print
  certificateFrom: { type: String, default: "BRAVYNEX ENGINEERING" },
  defaultCertificateGrade: { type: String, default: "A" },
  students: [
    {
      studentId: String,
      studentName: String,
      studentEmail: String,
      paidAmount: String,
    },
  ],
  curriculum: [LectureSchema],
  isPublised: Boolean,
});

module.exports = mongoose.model("Course", CourseSchema);

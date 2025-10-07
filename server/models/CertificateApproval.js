const mongoose = require("mongoose");

const CertificateApprovalSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    approvedBy: { type: String }, // instructor/admin id
    approvedAt: { type: Date },
    revoked: { type: Boolean, default: false },
    revokedAt: { type: Date },
    notes: { type: String },
    // Snapshot of details at approval time to avoid future drift
    studentName: { type: String },
    studentEmail: { type: String },
    studentFatherName: { type: String },
    courseTitle: { type: String },
    grade: { type: String, default: "A" },
  },
  { timestamps: true }
);

CertificateApprovalSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("CertificateApproval", CertificateApprovalSchema);



const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject:   { type: String, required: true, trim: true },
  marks:     { type: Number, required: true, min: 0 },
  maxMarks:  { type: Number, required: true, default: 100, min: 1 },
  examType:  { type: String, required: true, enum: ['Unit Test', 'Midterm', 'Final', 'Assignment', 'Quiz', 'Other'] },
  examDate:  { type: Date, required: true },
  remarks:   { type: String, default: '' },

  // Cloudinary document (optional — marksheet / answer sheet)
  documentUrl:       { type: String, default: '' },
  documentPublicId:  { type: String, default: '' },

  // Computed grade stored on save so aggregation pipeline can group by $grade
  grade: { type: String, default: '' },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// ── Compute grade before every save ──────────────────────────────────────
function computeGrade(marks, maxMarks) {
  const pct = (marks / maxMarks) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
}

resultSchema.pre('save', function (next) {
  if (this.isModified('marks') || this.isModified('maxMarks') || !this.grade) {
    this.grade = computeGrade(this.marks, this.maxMarks);
  }
  next();
});

// ── Virtual: percentage ───────────────────────────────────────────────────
resultSchema.virtual('percentage').get(function () {
  return parseFloat(((this.marks / this.maxMarks) * 100).toFixed(1));
});

resultSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Result || mongoose.model('Result', resultSchema);

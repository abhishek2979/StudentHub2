const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/auth');
const { uploadAssignmentPdf, uploadSubmissionPdf } = require('../config/cloudinary');
const { getAssignments, createAssignment, updateAssignment, deleteAssignment } = require('../controllers/assignmentController');
const { submitAssignment, getMySubmission, getSubmissionsForAssignment, gradeSubmission } = require('../controllers/submissionController');

// ── Submission grade route (must be before /:id to avoid conflict) ────────
router.put('/submissions/:submissionId/grade', protect, gradeSubmission);

// ── Assignment CRUD ───────────────────────────────────────────────────────
router.get('/',        protect, getAssignments);
router.post('/',       protect, uploadAssignmentPdf.single('pdf'), createAssignment);
router.put('/:id',     protect, uploadAssignmentPdf.single('pdf'), updateAssignment);
router.delete('/:id',  protect, deleteAssignment);

// ── Submission sub-routes ─────────────────────────────────────────────────
router.post('/:assignmentId/submit',       protect, uploadSubmissionPdf.single('pdf'), submitAssignment);
router.get('/:assignmentId/my-submission', protect, getMySubmission);
router.get('/:assignmentId/submissions',   protect, getSubmissionsForAssignment);

module.exports = router;

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Storage for profile pictures ─────────────────────────────────────────
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'student-management/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

// ── Storage for result documents (image OR pdf) ───────────────────────────
// BUG FIX: Using a function for params and setting resource_type: 'raw' for
// PDFs fixes the HTTP 401 error. When resource_type is 'auto' in a plain
// params object, some versions of multer-storage-cloudinary ignore it and
// upload PDFs as 'image' type. This results in a URL like /image/upload/...pdf
// which Cloudinary returns 401 for (PDFs cannot be served as images).
// Changing to resource_type: 'raw' ensures PDFs get a /raw/upload/... URL
// which Cloudinary serves correctly.
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'student-management/documents',
    resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
    format: file.mimetype === 'application/pdf' ? 'pdf' : undefined,
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  }),
});

// ── Storage for teacher note PDFs ─────────────────────────────────────────
const notePdfStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'student-management/notes',
    resource_type: 'raw',   // PDFs must be 'raw', not 'auto' or 'image'
    format: 'pdf',
  }),
});

// ── Storage for teacher assignment PDFs ───────────────────────────────────
const assignmentPdfStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'student-management/assignments',
    resource_type: 'raw',   // PDFs must be 'raw', not 'auto' or 'image'
    format: 'pdf',
  }),
});

// ── Storage for student submission PDFs ──────────────────────────────────
const submissionPdfStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'student-management/submissions',
    resource_type: 'raw',   // PDFs must be 'raw', not 'auto' or 'image'
    format: 'pdf',
  }),
});

const uploadProfile       = multer({ storage: profileStorage,       limits: { fileSize: 5  * 1024 * 1024 } });
const uploadDocument      = multer({ storage: documentStorage,      limits: { fileSize: 10 * 1024 * 1024 } });
const uploadNotePdf       = multer({ storage: notePdfStorage,       limits: { fileSize: 20 * 1024 * 1024 } });
const uploadAssignmentPdf = multer({ storage: assignmentPdfStorage, limits: { fileSize: 20 * 1024 * 1024 } });
const uploadSubmissionPdf = multer({ storage: submissionPdfStorage, limits: { fileSize: 20 * 1024 * 1024 } });

module.exports = {
  cloudinary,
  uploadProfile,
  uploadDocument,
  uploadNotePdf,
  uploadAssignmentPdf,
  uploadSubmissionPdf,
};

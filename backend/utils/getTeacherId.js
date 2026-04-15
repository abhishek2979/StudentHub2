const User    = require('../models/User');
const Student = require('../models/Student');

const getTeacherId = async (req) => {
  try {
    const studentUser = await User.findById(req.user._id);

    // 1. Primary — User.createdBy (set on all new students)
    if (studentUser?.createdBy) return studentUser.createdBy;

    // 2. Fallback — Student.createdBy
    if (studentUser?.studentRef) {
      const studentDoc = await Student.findById(studentUser.studentRef);
      if (studentDoc?.createdBy) return studentDoc.createdBy;
    }

  } catch (err) {
    console.error('getTeacherId error:', err.message);
  }
  return null;
};

module.exports = getTeacherId;

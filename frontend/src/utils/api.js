import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      const isAuthCall = url.includes('/auth/google') ||
                         url.includes('/auth/login')  ||
                         url.includes('/auth/teacher');
      if (!isAuthCall) {
        localStorage.removeItem('sh_token');
        localStorage.removeItem('sh_user');
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────────────────────────────
export const authAPI = {
  googleAuth:      data => api.post('/auth/google',           data),
  teacherRegister: data => api.post('/auth/teacher/register', data),
  teacherLogin:    data => api.post('/auth/teacher/login',    data),
  login:           data => api.post('/auth/login',            data),
  getMe:           ()   => api.get('/auth/me'),
  updateProfile:   data => api.put('/auth/update-profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword:  data => api.put('/auth/change-password', data),
  forgotPassword:  data => api.post('/auth/forgot-password', data),
  resetPassword:   data => api.post('/auth/reset-password',  data),
};

// ── STUDENTS ──────────────────────────────────────────────────────────────
export const studentAPI = {
  getAll:        params     => api.get('/students', { params }),
  getOne:        id         => api.get(`/students/${id}`),
  create:        data       => api.post('/students', data),
  update:        (id, data) => api.put(`/students/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:        id         => api.delete(`/students/${id}`),
  getStats:      ()         => api.get('/students/stats'),
  resetPassword: (id, data) => api.put(`/students/${id}/reset-password`, data),
};

// ── ATTENDANCE ────────────────────────────────────────────────────────────
export const attendanceAPI = {
  mark:          data         => api.post('/attendance', data),
  getByDate:     params       => api.get('/attendance/by-date', { params }),
  getForStudent: (id, params) => api.get(`/attendance/student/${id}`, { params }),
  getClassStats: params       => api.get('/attendance/class-stats', { params }),
};

// ── RESULTS ───────────────────────────────────────────────────────────────
export const resultAPI = {
  add:           data         => api.post('/results', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll:        params       => api.get('/results/all', { params }),
  getForStudent: (id, params) => api.get(`/results/student/${id}`, { params }),
  update:        (id, data)   => api.put(`/results/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:        id           => api.delete(`/results/${id}`),
  getStats:      params       => api.get('/results/performance-stats', { params }),
};

// ── NOTES ─────────────────────────────────────────────────────────────────
export const noteAPI = {
  getAll:  ()         => api.get('/notes'),
  create:  data       => api.post('/notes',     data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id, data) => api.put(`/notes/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  id         => api.delete(`/notes/${id}`),
};

// ── ASSIGNMENTS ───────────────────────────────────────────────────────────
export const assignmentAPI = {
  getAll:  ()         => api.get('/assignments'),
  create:  data       => api.post('/assignments',     data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id, data) => api.put(`/assignments/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  id         => api.delete(`/assignments/${id}`),
};

// ── SUBMISSIONS ───────────────────────────────────────────────────────────
export const submissionAPI = {
  submit:        (assignmentId, data)    => api.post(`/assignments/${assignmentId}/submit`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMySubmission: (assignmentId)        => api.get(`/assignments/${assignmentId}/my-submission`),
  getSubmissions:  (assignmentId)        => api.get(`/assignments/${assignmentId}/submissions`),
  grade:         (submissionId, data)    => api.put(`/assignments/submissions/${submissionId}/grade`, data),
};

// ── QUIZ ──────────────────────────────────────────────────────────────────
export const quizAPI = {
  getAll:          ()         => api.get('/quiz'),
  create:          data       => api.post('/quiz', data),
  update:          (id, data) => api.put(`/quiz/${id}`, data),
  toggle:          id         => api.patch(`/quiz/${id}/toggle`),
  delete:          id         => api.delete(`/quiz/${id}`),
  getResults:      id         => api.get(`/quiz/${id}/results`),
  getStudentList:  ()         => api.get('/quiz/student/list'),
  getQuizToTake:   id         => api.get(`/quiz/student/${id}/take`),
  submitQuiz:      (id, data) => api.post(`/quiz/student/${id}/submit`, data),
};

export default api;

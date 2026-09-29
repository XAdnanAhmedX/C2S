import axios from 'axios';

const API_BASE_URL = window.C2S_API_URL || 'http://localhost/c2s/backend';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth.php?action=login', { email, password }),
  logout: () =>
    api.post('/auth.php?action=logout'),
  checkAuth: () =>
    api.get('/auth.php?action=check'),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    api.get('/dashboard.php?action=stats'),
  getWorkers: () =>
    api.get('/dashboard.php?action=workers'),
  getProduction: () =>
    api.get('/dashboard.php?action=production'),
  getDefects: () =>
    api.get('/dashboard.php?action=defects'),
};

// Workers & Performance & Recognition API
export const workersAPI = {
  getWorkers: (page = 1, limit = 10, department = '', search = '') =>
    api.get(
      `/workers.php?action=list&page=${page}&limit=${limit}&department=${department}&search=${search}`,
    ),
  assignTraining: (data) =>
    api.post('/workers.php?action=assign_training', data),
  awardRecognition: (data) =>
    api.post('/workers.php?action=award_recognition', data),
};

// Attendance & Availability API
export const attendanceAPI = {
  getAttendance: (date, shift = 'all') =>
    api.get(`/attendance.php?action=list&date=${date}&shift=${shift}`),
  getAvailability: () =>
    api.get('/attendance.php?action=availability'),
  markAttendance: (data) =>
    api.post('/attendance.php?action=mark', data),
};

// Production Line API
export const productionAPI = {
  getLines: () => api.get('/production.php?action=lines'),
  createLine: (data) =>
    api.post('/production.php?action=create_line', data),
  getStats: () =>
    api.get('/production.php?action=stats'),
};

// Waste Tracking API
export const wasteAPI = {
  getStats: () =>
    api.get('/waste.php?action=stats'),
  addWaste: (data) =>
    api.post('/waste.php?action=add_waste', data),
  applyPattern: (data) =>
    api.post('/waste.php?action=apply_pattern', data),
};

// Quality Control API
export const qualityAPI = {
  getStats: () =>
    api.get('/quality.php?action=stats'),
  getInspections: () =>
    api.get('/quality.php?action=inspections'),
  createInspection: (data) =>
    api.post('/quality.php?action=create_inspection', data),
};

// Worker Safety Reporting API (Bilingual Bengali/English)
export const safetyAPI = {
  getReports: () =>
    api.get('/safety.php?action=list'),
  submitReport: (data) =>
    api.post('/safety.php?action=submit', data),
  resolveReport: (data) =>
    api.post('/safety.php?action=resolve', data),
};

// Job Sequencing API
export const jobsAPI = {
  getQueue: () => api.get('/jobs.php?action=queue'),
  addJob: (data) =>
    api.post('/jobs.php?action=add_job', data),
};

// Machine Maintenance API
export const machinesAPI = {
  getMachines: () =>
    api.get('/machines.php?action=list'),
  createWorkOrder: (data) =>
    api.post('/machines.php?action=create_work_order', data),
};

// AI Insights API
export const aiAPI = {
  getInsights: () =>
    api.get('/ai.php?action=insights'),
};

// Reports & Compliance API
export const reportsAPI = {
  getCompliance: () =>
    api.get('/reports.php?action=compliance'),
  getDailyProduction: (date) =>
    api.get(`/reports.php?action=daily_production&date=${date}`),
  shareDossier: (data) =>
    api.post('/reports.php?action=share_dossier', data),
};

// Chats API
export const chatsAPI = {
  getChannels: () => api.get('/chats.php?action=channels'),
  getMessages: (channelId) =>
    api.get(`/chats.php?action=messages&channel_id=${channelId}`),
  sendMessage: (data) =>
    api.post('/chats.php?action=send', data),
};

// Inventory API
export const inventoryAPI = {
  getStats: () =>
    api.get('/inventory.php?action=stats'),
  getProducts: (page = 1, limit = 10, search = '') =>
    api.get(
      `/inventory.php?action=products&page=${page}&limit=${limit}&search=${search}`,
    ),
  addProduct: (productData) =>
    api.post('/inventory.php?action=add', productData),
  updateProduct: (productData) =>
    api.post('/inventory.php?action=update', productData),
  deleteProduct: (id) =>
    api.post('/inventory.php?action=delete', { id }),
};

// Users API
export const usersAPI = {
  addUser: (userData) =>
    api.post('/users.php?action=add', userData),
  getUsers: (page = 1, limit = 10, search = '', role = '') =>
    api.get(
      `/users.php?action=list&page=${page}&limit=${limit}&search=${search}&role=${role}`,
    ),
  updateUser: (userData) =>
    api.post('/users.php?action=update', userData),
  deleteUser: (id) =>
    api.post('/users.php?action=delete', { id }),
};

// ─── Worker Dashboard API ────────────────────────────────────────────────────
export const workerDashboardAPI = {
  getProfile: (userId) =>
    api.get(`/worker_dashboard.php?action=profile&user_id=${userId}`),
  getAttendanceChart: (userId) =>
    api.get(`/worker_dashboard.php?action=attendance_chart&user_id=${userId}`),
  getRecentAttendance: (userId) =>
    api.get(`/worker_dashboard.php?action=recent_attendance&user_id=${userId}`),
  getConsistencyRating: (userId) =>
    api.get(`/worker_dashboard.php?action=consistency_rating&user_id=${userId}`),
  getBonusEligibility: (userId) =>
    api.get(`/worker_dashboard.php?action=bonus_eligibility&user_id=${userId}`),
  getOvertimeStatus: (userId) =>
    api.get(`/worker_dashboard.php?action=overtime_status&user_id=${userId}`),
  requestOvertime: (data) =>
    api.post('/worker_dashboard.php?action=request_overtime', data),
};

// ─── Worker Payment API ───────────────────────────────────────────────────────
export const workerPaymentAPI = {
  getPayslips: (userId) =>
    api.get(`/worker_payment.php?action=payslips&user_id=${userId}`),
  getPaymentMethods: (userId) =>
    api.get(`/worker_payment.php?action=payment_methods&user_id=${userId}`),
  addPaymentMethod: (data) =>
    api.post('/worker_payment.php?action=add_method', data),
  setPrimary: (data) =>
    api.post('/worker_payment.php?action=set_primary', data),
};

// ─── Worker Settings API ──────────────────────────────────────────────────────
export const workerSettingsAPI = {
  getProfile: (userId) =>
    api.get(`/worker_settings.php?action=profile&user_id=${userId}`),
  updateProfile: (data) =>
    api.post('/worker_settings.php?action=update_profile', data),
  changePassword: (data) =>
    api.post('/worker_settings.php?action=change_password', data),
  getSupervisors: () =>
    api.get('/worker_settings.php?action=get_supervisors'),
};

export default api;

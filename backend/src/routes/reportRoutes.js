const express = require('express');
const router = express.Router();
const {
  createReport,
  getAdminReports,
  updateReportStatus,
} = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

router.post('/', authenticate, createReport);
router.get('/admin', authenticate, requireAdmin, getAdminReports);
router.put('/admin/:id', authenticate, requireAdmin, updateReportStatus);

module.exports = router;

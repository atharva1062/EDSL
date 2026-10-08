const express = require('express');
const router = express.Router();
const {
  register,
  login,
  resetPassword,
  getMe,
  updateProfile,
  getUserPublicProfile,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.get('/user/:id', getUserPublicProfile);

module.exports = router;

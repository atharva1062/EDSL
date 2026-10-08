const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getThreadWithUser,
  getConversations,
} = require('../controllers/messageController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/thread/:userId', getThreadWithUser);

module.exports = router;

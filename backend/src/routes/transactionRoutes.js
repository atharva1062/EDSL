const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getMyTransactions,
  getTransactionById,
  updateTransactionStatus,
} = require('../controllers/transactionController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/', createTransaction);
router.get('/', getMyTransactions);
router.get('/:id', getTransactionById);
router.put('/:id/status', updateTransactionStatus);

module.exports = router;

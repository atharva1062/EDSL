const express = require('express');
const router = express.Router();
const { createReview, getUserReviews } = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/user/:id', getUserReviews);
router.post('/', authenticate, createReview);

module.exports = router;

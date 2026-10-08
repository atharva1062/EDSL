const prisma = require('../config/db');

/**
 * Submit a review for a completed transaction
 * POST /api/reviews
 */
const createReview = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { transactionId, rating, comment } = req.body;

    if (!transactionId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and rating (1-5) are required.',
      });
    }

    const numericRating = parseInt(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5 stars.',
      });
    }

    // Verify transaction exists and is completed
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(transactionId) },
      include: { review: true, listing: true },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    if (transaction.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed transactions.',
      });
    }

    // Check if review already exists
    if (transaction.review) {
      return res.status(400).json({
        success: false,
        message: 'A review has already been submitted for this transaction.',
      });
    }

    // Determine who is being reviewed (if buyer is reviewing, reviewee is seller, and vice-versa)
    let revieweeId;
    if (transaction.buyerId === reviewerId) {
      revieweeId = transaction.sellerId;
    } else if (transaction.sellerId === reviewerId) {
      revieweeId = transaction.buyerId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'You were not a participant in this transaction.',
      });
    }

    const review = await prisma.review.create({
      data: {
        reviewerId,
        revieweeId,
        transactionId: transaction.id,
        rating: numericRating,
        comment: comment ? comment.trim() : null,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Notify reviewee
    await prisma.notification.create({
      data: {
        userId: revieweeId,
        title: 'New Star Rating Received! ⭐',
        message: `${req.user.name} rated you ${numericRating}/5 stars for "${transaction.listing.title}".`,
        type: 'REVIEW',
        link: `/users/${revieweeId}`,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review,
    });
  } catch (error) {
    console.error('CreateReview Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit review.',
      error: error.message,
    });
  }
};

/**
 * Get all reviews for a specific user
 * GET /api/reviews/user/:id
 */
const getUserReviews = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: { id: true, name: true, avatar: true, campus: true },
        },
        transaction: {
          include: { listing: { select: { id: true, title: true, type: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const averageRating =
      reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 5.0;

    return res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: parseFloat(averageRating),
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews.',
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getUserReviews,
};

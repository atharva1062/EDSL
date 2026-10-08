const prisma = require('../config/db');

/**
 * Create a transaction request (BUY, RENT, or SWAP)
 * POST /api/transactions
 */
const createTransaction = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const {
      listingId,
      type, // BUY, RENT, SWAP
      amount,
      swapItemDetails,
      rentDays,
      meetLocation,
      note,
    } = req.body;

    if (!listingId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID and transaction type are required.',
      });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(listingId) },
      include: { seller: true },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    if (listing.sellerId === buyerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request your own listing.',
      });
    }

    if (listing.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: `This item is currently ${listing.status.toLowerCase()}.`,
      });
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        listingId: listing.id,
        buyerId,
        sellerId: listing.sellerId,
        type: type.toUpperCase(),
        amount: parseFloat(amount) || listing.price || 0.0,
        swapItemDetails: swapItemDetails ? swapItemDetails.trim() : null,
        rentDays: rentDays ? parseInt(rentDays) : null,
        meetLocation: meetLocation || listing.pickupLocation || 'Campus Library',
        note: note ? note.trim() : null,
        status: 'PENDING',
      },
      include: {
        listing: true,
        buyer: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        seller: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: listing.sellerId,
        title: `New ${type.toUpperCase()} Request! 🤝`,
        message: `${req.user.name} requested to ${type.toLowerCase()} "${listing.title}". Click to view details and accept.`,
        type: 'TRANSACTION',
        link: '/transactions',
      },
    });

    return res.status(201).json({
      success: true,
      message: `${type.toUpperCase()} request sent to seller!`,
      transaction,
    });
  } catch (error) {
    console.error('CreateTransaction Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create transaction request.',
      error: error.message,
    });
  }
};

/**
 * Get all transactions involving the logged-in user
 * GET /api/transactions
 */
const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.query; // 'buyer', 'seller', or all

    const where = {};
    if (role === 'buyer') {
      where.buyerId = userId;
    } else if (role === 'seller') {
      where.sellerId = userId;
    } else {
      where.OR = [{ buyerId: userId }, { sellerId: userId }];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        listing: {
          include: { category: true },
        },
        buyer: {
          select: { id: true, name: true, email: true, avatar: true, phone: true, campus: true },
        },
        seller: {
          select: { id: true, name: true, email: true, avatar: true, phone: true, campus: true },
        },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions.',
      error: error.message,
    });
  }
};

/**
 * Get single transaction by ID
 * GET /api/transactions/:id
 */
const getTransactionById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.id;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        listing: {
          include: { category: true },
        },
        buyer: {
          select: { id: true, name: true, email: true, avatar: true, phone: true, campus: true },
        },
        seller: {
          select: { id: true, name: true, email: true, avatar: true, phone: true, campus: true },
        },
        review: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    // Only buyer, seller, or admin can see it
    if (
      transaction.buyerId !== userId &&
      transaction.sellerId !== userId &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this transaction.',
      });
    }

    return res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction.',
      error: error.message,
    });
  }
};

/**
 * Update transaction status (ACCEPT, REJECT, COMPLETE, CANCEL)
 * PUT /api/transactions/:id/status
 */
const updateTransactionStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.id;
    const { status, meetLocation } = req.body; // ACCEPTED, REJECTED, COMPLETED, CANCELLED

    const validStatuses = ['ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status update.',
      });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { listing: true, buyer: true, seller: true },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    const isSeller = transaction.sellerId === userId;
    const isBuyer = transaction.buyerId === userId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isSeller && !isBuyer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this transaction.',
      });
    }

    // Seller-only actions: ACCEPT, REJECT
    if ((status === 'ACCEPTED' || status === 'REJECTED') && !isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can accept or reject requests.',
      });
    }

    // Update transaction
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        status,
        ...(meetLocation && { meetLocation }),
      },
      include: {
        listing: true,
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    // Handle listing status sync
    if (status === 'ACCEPTED') {
      await prisma.listing.update({
        where: { id: transaction.listingId },
        data: { status: 'RESERVED' },
      });

      // Send notification to buyer
      await prisma.notification.create({
        data: {
          userId: transaction.buyerId,
          title: 'Request Accepted! 🎉',
          message: `${transaction.seller.name} accepted your ${transaction.type.toLowerCase()} request for "${transaction.listing.title}". Coordinate pickup now!`,
          type: 'TRANSACTION',
          link: '/transactions',
        },
      });
    } else if (status === 'COMPLETED') {
      let finalListingStatus = 'SOLD';
      if (transaction.type === 'RENT') finalListingStatus = 'RENTED';
      if (transaction.type === 'SWAP') finalListingStatus = 'SWAPPED';

      await prisma.listing.update({
        where: { id: transaction.listingId },
        data: { status: finalListingStatus },
      });

      // Notify both parties to leave a review
      await prisma.notification.create({
        data: {
          userId: transaction.buyerId,
          title: 'Transaction Completed! ⭐',
          message: `Your deal for "${transaction.listing.title}" is complete. Leave a rating for ${transaction.seller.name}!`,
          type: 'REVIEW',
          link: '/transactions',
        },
      });
    } else if (status === 'CANCELLED' || status === 'REJECTED') {
      // Free the listing back up if it was reserved
      if (transaction.listing.status === 'RESERVED') {
        await prisma.listing.update({
          where: { id: transaction.listingId },
          data: { status: 'AVAILABLE' },
        });
      }

      const notifyUser = isSeller ? transaction.buyerId : transaction.sellerId;
      await prisma.notification.create({
        data: {
          userId: notifyUser,
          title: `Transaction ${status}`,
          message: `The ${transaction.type.toLowerCase()} request for "${transaction.listing.title}" was ${status.toLowerCase()}.`,
          type: 'TRANSACTION',
          link: '/transactions',
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Transaction ${status.toLowerCase()} successfully.`,
      transaction: updated,
    });
  } catch (error) {
    console.error('UpdateTransaction Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update transaction status.',
      error: error.message,
    });
  }
};

module.exports = {
  createTransaction,
  getMyTransactions,
  getTransactionById,
  updateTransactionStatus,
};

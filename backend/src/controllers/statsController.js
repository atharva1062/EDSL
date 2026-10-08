const prisma = require('../config/db');

/**
 * Get overview stats for homepage banner & admin dashboard
 * GET /api/stats/overview
 */
const getOverviewStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalListings,
      activeListings,
      totalTransactions,
      completedTransactions,
      categoriesCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'AVAILABLE' } }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }),
      prisma.category.count(),
    ]);

    // Breakdown by type
    const [sellCount, rentCount, swapCount] = await Promise.all([
      prisma.listing.count({ where: { type: 'SELL', status: 'AVAILABLE' } }),
      prisma.listing.count({ where: { type: 'RENT', status: 'AVAILABLE' } }),
      prisma.listing.count({ where: { type: 'SWAP', status: 'AVAILABLE' } }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents: totalUsers,
        totalListings,
        activeListings,
        totalDeals: totalTransactions,
        completedDeals: completedTransactions,
        categoriesCount,
        types: {
          sell: sellCount,
          rent: rentCount,
          swap: swapCount,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch overview stats.',
      error: error.message,
    });
  }
};

module.exports = {
  getOverviewStats,
};

const prisma = require('../config/db');

/**
 * Submit a report on a suspicious or inappropriate listing
 * POST /api/reports
 */
const createReport = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const { listingId, reason, description } = req.body;

    if (!listingId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID and reason are required.',
      });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(listingId) },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        listingId: listing.id,
        reason: reason.trim(),
        description: description ? description.trim() : null,
        status: 'PENDING',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted for admin review. Thank you for keeping CampusSwap safe!',
      report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit report.',
      error: error.message,
    });
  }
};

/**
 * Get all reports (Admin only)
 * GET /api/admin/reports
 */
const getAdminReports = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, email: true, campus: true },
        },
        listing: {
          include: {
            category: true,
            seller: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports.',
      error: error.message,
    });
  }
};

/**
 * Update report status / take action (Admin only)
 * PUT /api/admin/reports/:id
 */
const updateReportStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, adminNotes, removeListing } = req.body;

    const report = await prisma.report.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        ...(status && { status: status.toUpperCase() }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });

    // Optionally remove offending listing
    if (removeListing && report.listingId) {
      await prisma.listing.delete({
        where: { id: report.listingId },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Report updated successfully.',
      report: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update report.',
      error: error.message,
    });
  }
};

module.exports = {
  createReport,
  getAdminReports,
  updateReportStatus,
};

const prisma = require('../config/db');

/**
 * Get all product categories with listing counts
 * GET /api/categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            listings: {
              where: { status: 'AVAILABLE' },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      description: c.description,
      availableCount: c._count.listings,
    }));

    return res.status(200).json({
      success: true,
      categories: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories.',
      error: error.message,
    });
  }
};

/**
 * Create a new category (Admin only)
 * POST /api/categories
 */
const createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        icon: icon || 'Tag',
        description: description ? description.trim() : null,
      },
    });

    return res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating category.',
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
};

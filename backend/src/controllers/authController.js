const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { validateCampusEmail } = require('../utils/helpers');

/**
 * Register a new student user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, collegeId, phone, campus, bio } = req.body;

    // Validation
    if (!name || !email || (!password && !phone)) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password or phone are required.',
      });
    }

    // Default password is phone number if password not provided
    const userPassword = password || phone;

    if (userPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password / Mobile Number must be at least 6 digits.',
      });
    }

    // Verify campus email domain
    const isValidDomain = validateCampusEmail(email);
    if (!isValidDomain) {
      return res.status(400).json({
        success: false,
        message: 'Please register with a valid college/campus email address.',
      });
    }

    // Check if user already exists by email or student ERP ID
    const cleanEmail = email.toLowerCase().trim();
    const cleanCollegeId = collegeId ? collegeId.trim() : null;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(cleanCollegeId ? [{ collegeId: cleanCollegeId }] : []),
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email or Student ERP ID already exists. Please log in.',
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userPassword, salt);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        collegeId: cleanCollegeId,
        phone: phone ? phone.trim() : null,
        campus: campus || 'Main Campus',
        bio: bio ? bio.trim() : null,
        role: cleanEmail.includes('admin') ? 'ADMIN' : 'STUDENT',
        isVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        collegeId: true,
        phone: true,
        avatar: true,
        campus: true,
        bio: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: 'Welcome to CampusSwap! 🎓',
        message: 'Your campus account is verified. Start exploring listings or post your own gear.',
        type: 'SYSTEM',
        link: '/browse',
      },
    });

    // Generate JWT token
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      token,
      user: newUser,
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    });
  }
};

/**
 * Login user (Supports Email OR Student ERP / Roll No., with password or default Mobile Number)
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginId = (identifier || email || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'College email / Student ERP ID and password are required.',
      });
    }

    // Find user by email or student collegeId (ERP / Roll No.)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId.toLowerCase() },
          { collegeId: loginId },
          { collegeId: loginId.toUpperCase() },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No student account found with this email or Student ERP ID.',
      });
    }

    // Check 1: Verify standard bcrypt password
    let isPasswordValid = await bcrypt.compare(password, user.password);

    // Check 2: If standard password fails, verify if entered password matches default Mobile Number!
    if (!isPasswordValid && user.phone) {
      const cleanInput = password.replace(/\D/g, '');
      const cleanPhone = user.phone.replace(/\D/g, '');
      if (cleanInput && cleanPhone && (cleanInput === cleanPhone || cleanPhone.endsWith(cleanInput))) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. (Default is your registered Mobile No., or click "Forgot Password" to reset)',
      });
    }

    // Generate token
    const token = generateToken(user);

    // Sanitized user object
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      phone: user.phone,
      avatar: user.avatar,
      campus: user.campus,
      bio: user.bio,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message,
    });
  }
};

/**
 * Reset / Forgot Password flow using Student ERP / Email + Registered Mobile No.
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { identifier, phone, newPassword } = req.body;

    if (!identifier || !phone || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Student ERP ID / Email, registered mobile number, and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const loginId = identifier.trim();

    // Find student by email or ERP ID
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId.toLowerCase() },
          { collegeId: loginId },
          { collegeId: loginId.toUpperCase() },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No student account matches this Email or Student ERP ID.',
      });
    }

    // Verify phone number
    const cleanInputPhone = phone.replace(/\D/g, '');
    const cleanUserPhone = (user.phone || '').replace(/\D/g, '');

    if (!cleanUserPhone || !(cleanUserPhone === cleanInputPhone || cleanUserPhone.endsWith(cleanInputPhone))) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number does not match student records on file.',
      });
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: 'Password successfully updated! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password.',
      error: error.message,
    });
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        collegeId: true,
        phone: true,
        avatar: true,
        campus: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            buyerPurchases: true,
            sellerSales: true,
            reviewsReceived: true,
            savedItems: true,
          },
        },
      },
    });

    // Calculate user's average rating
    const reviews = await prisma.review.findMany({
      where: { revieweeId: req.user.id },
      select: { rating: true },
    });

    const averageRating =
      reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        averageRating: averageRating ? parseFloat(averageRating) : 5.0,
        reviewCount: reviews.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.',
      error: error.message,
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, collegeId, campus, bio, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(collegeId !== undefined && { collegeId: collegeId ? collegeId.trim() : null }),
        ...(campus && { campus }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        collegeId: true,
        phone: true,
        avatar: true,
        campus: true,
        bio: true,
        isVerified: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: error.message,
    });
  }
};

/**
 * Get public user profile by ID
 * GET /api/users/:id
 */
const getUserPublicProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
        campus: true,
        bio: true,
        role: true,
        createdAt: true,
        listings: {
          where: { status: 'AVAILABLE' },
          include: {
            category: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        reviewsReceived: {
          include: {
            reviewer: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    const ratings = user.reviewsReceived.map((r) => r.rating);
    const averageRating =
      ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : 5.0;

    return res.status(200).json({
      success: true,
      profile: {
        ...user,
        averageRating: parseFloat(averageRating),
        reviewCount: ratings.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile.',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  resetPassword,
  getMe,
  updateProfile,
  getUserPublicProfile,
};

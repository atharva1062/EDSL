const prisma = require('../config/db');

/**
 * Send a message to another student regarding a listing or meetup
 * POST /api/messages
 */
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, listingId, content } = req.body;

    if (!receiverId || !content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and message content are required.',
      });
    }

    if (parseInt(receiverId) === senderId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself.',
      });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: parseInt(receiverId),
        listingId: listingId ? parseInt(listingId) : null,
        content: content.trim(),
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        receiver: {
          select: { id: true, name: true, avatar: true },
        },
        listing: {
          select: { id: true, title: true, price: true, imageUrl: true },
        },
      },
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: parseInt(receiverId),
        title: `Message from ${req.user.name} 💬`,
        message: content.length > 60 ? content.substring(0, 60) + '...' : content,
        type: 'MESSAGE',
        link: `/messages?user=${senderId}`,
      },
    });

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send message.',
      error: error.message,
    });
  }
};

/**
 * Get chat conversation thread with a specific user
 * GET /api/messages/thread/:userId
 */
const getThreadWithUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = parseInt(req.params.userId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: currentUserId },
        ],
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        receiver: {
          select: { id: true, name: true, avatar: true },
        },
        listing: {
          select: { id: true, title: true, price: true, imageUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark received messages in this thread as read
    await prisma.message.updateMany({
      where: {
        senderId: targetUserId,
        receiverId: currentUserId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversation.',
      error: error.message,
    });
  }
};

/**
 * Get all active conversation threads for current user
 * GET /api/messages/conversations
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all messages sent or received by user
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true, campus: true },
        },
        receiver: {
          select: { id: true, name: true, avatar: true, campus: true },
        },
        listing: {
          select: { id: true, title: true, imageUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const conversationMap = new Map();

    for (const msg of messages) {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversationMap.has(otherUser.id)) {
        conversationMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: msg.receiverId === userId && !msg.isRead ? 1 : 0,
        });
      } else if (msg.receiverId === userId && !msg.isRead) {
        const conv = conversationMap.get(otherUser.id);
        conv.unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationMap.values());

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations.',
      error: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getThreadWithUser,
  getConversations,
};

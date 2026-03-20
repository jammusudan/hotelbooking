import Notification from '../models/Notification.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Utility to create a notification and trigger Socket/Email
// @access  Internal
export const createNotification = async (app, userId, type, message, emailData = null) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      message,
    });

    // Real-time notification via Socket.io
    const io = app.get('socketio');
    if (io) {
      io.to(`user_${userId}`).emit('new_notification', notification);
    }

    // Email notification via Nodemailer
    if (emailData && emailData.email) {
      await sendEmail({
        email: emailData.email,
        subject: emailData.subject || `Navan Notification: ${type.toUpperCase()}`,
        message: message,
        html: emailData.html || `<p>${message}</p>`,
      });
    }

    return notification;
  } catch (error) {
    console.error(`Error in createNotification: ${error.message}`);
  }
};

// @desc    Broadcast a promotional notification to all users
// @route   POST /api/notifications/broadcast
// @access  Private/Admin
export const broadcastPromotion = async (req, res) => {
  try {
    const { message, title } = req.body;
    
    // In a real app, we'd use a more efficient batch process or a message queue
    // For this implementation, we'll create a system notification that can be 
    // queried or sent to active sockets.
    
    // For now, let's emit to all connected sockets as a global announcement
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_notification', {
        type: 'promotion',
        message,
        createdAt: new Date(),
        isRead: false
      });
    }

    res.json({ message: 'Promotion broadcasted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

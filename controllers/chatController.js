const Chat = require('../models/Chat');
const User = require('../models/User');
const Admin = require('../models/Admin');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;
    const senderModel = req.user.role === 'admin' ? 'Admin' : 'User';
    const receiverModel = senderModel === 'Admin' ? 'User' : 'Admin';

    const newMessage = await Chat.create({
      sender: senderId,
      senderModel,
      receiver: receiverId,
      receiverModel,
      message
    });

    // Populate the message with sender and receiver details
    const populatedMessage = await Chat.findById(newMessage._id)
      .populate('sender', 'fullName email')
      .populate('receiver', 'fullName email');

    // Emit the message through Socket.IO
    req.io.emit('newMessage', {
      _id: newMessage._id,
      senderId,
      receiverId,
      message,
      timestamp: newMessage.timestamp,
      sender: populatedMessage.sender,
      receiver: populatedMessage.receiver
    });

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { participantId } = req.params;
    const userRole = req.user.role === 'admin' ? 'Admin' : 'User';

    const messages = await Chat.find({
      $or: [
        { sender: userId, receiver: participantId },
        { sender: participantId, receiver: userId }
      ]
    })
    .sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

exports.getChatParticipants = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role === 'admin' ? 'Admin' : 'User';

    let participants;
    if (userRole === 'Admin') {
      // For admin, get users who have chatted with this admin
      const chats = await Chat.find({
        $or: [
          { sender: userId },
          { receiver: userId }
        ]
      }).distinct('sender');

      participants = await User.find({
        _id: { $in: chats }
      }).select('fullName email profileImage');
    } else {
      // For users, get all admins
      participants = await Admin.find().select('email');
    }

    res.status(200).json({
      success: true,
      data: participants
    });
  } catch (error) {
    console.error('Get chat participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat participants'
    });
  }
};
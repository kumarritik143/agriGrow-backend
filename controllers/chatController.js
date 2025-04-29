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

    console.log('Getting participants for:', {
      userId,
      userRole
    });

    let participants;
    if (userRole === 'Admin') {
      // For admin, get users who have chatted with this admin
      const chats = await Chat.find({
        $or: [
          { sender: userId },
          { receiver: userId }
        ]
      });

      // Get unique user IDs from chats
      const userIds = [...new Set(chats.map(chat => 
        chat.sender.toString() === userId.toString() ? chat.receiver : chat.sender
      ))];

      participants = await User.find({
        _id: { $in: userIds }
      }).select('fullName email profileImage');

      console.log('Users who have chatted with admin:', JSON.stringify(participants, null, 2));
    } else {
      // For users, get all admins
      participants = await Admin.find({}, 'name email');
      
      // Log each admin's data separately
      console.log('Admins found in database:', participants.length);
      participants.forEach(admin => {
        console.log(`Admin data - ID: ${admin._id}, Name: ${admin.name}, Email: ${admin.email}`);
      });
    }

    // Transform the data
    const formattedParticipants = participants.map(participant => {
      if (userRole === 'Admin') {
        // For admin's view, show user's fullName
        return {
          _id: participant._id,
          name: participant.fullName,
          email: participant.email,
          profileImage: participant.profileImage,
          isAdmin: false
        };
      } else {
        // For user's view, show admin's name
        const formattedAdmin = {
          _id: participant._id,
          name: participant.name || participant.email, // Fallback to email if name is missing
          email: participant.email,
          isAdmin: true
        };
        console.log(`Formatted admin data:`, formattedAdmin);
        return formattedAdmin;
      }
    });

    console.log('Final formatted participants:', JSON.stringify(formattedParticipants, null, 2));

    res.status(200).json({
      success: true,
      data: formattedParticipants
    });
  } catch (error) {
    console.error('Get chat participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat participants'
    });
  }
};
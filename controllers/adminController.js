const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin email
    const admin = await Admin.findOne({ email }).select('+password');
    
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid admin credentials' 
      });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid admin credentials' 
      });
    }
   const token = generateToken(admin._id);
    res.status(200).json({
      success: true,
      admin: {
        _id: admin._id,
        email: admin.email,
        role: 'admin',
        isAdmin: true,
      },
      token: generateToken(admin._id)
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
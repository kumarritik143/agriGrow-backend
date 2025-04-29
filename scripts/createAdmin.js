const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
  try {
    // Check if MONGO_URI exists
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminData = {
      name: 'Shivam Kumar',
      email: 'shivam@gmail.com',
      password: '12345@abc',
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin already exists:', {
        name: existingAdmin.name,
        email: existingAdmin.email
      });
      process.exit(0);
    }

    const admin = await Admin.create(adminData);
    console.log('Admin created successfully:', {
      name: admin.name,
      email: admin.email,
      role: admin.role
    });

    // Verify the admin was created
    const verifyAdmin = await Admin.findOne({ email: adminData.email });
    console.log('Verification - Found admin:', {
      name: verifyAdmin.name,
      email: verifyAdmin.email,
      role: verifyAdmin.role
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
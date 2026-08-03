const mongoose = require('mongoose');

const User = require('../models/User');

const ensureDefaultAdmin = async () => {
  try {
    // Drop old non-sparse index if present
    await User.collection.dropIndex('googleId_1').catch(() => {});

    const adminEmail = 'admin@admin.com';
    let admin = await User.findOne({ email: adminEmail }).select('+password');
    if (!admin) {
      await User.create({
        name: 'Master System Admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        isActive: true,
        googleId: 'admin_local_account_id',
      });
      console.log('🛡️ Created default Admin account: admin@admin.com / admin123');
    } else {
      admin.password = 'admin123';
      admin.role = 'admin';
      admin.isActive = true;
      if (!admin.googleId) admin.googleId = 'admin_local_account_id';
      await admin.save();
      console.log('🛡️ Reset default Admin account credentials: admin@admin.com / admin123');
    }
  } catch (err) {
    console.error('⚠️ Default Admin seed warning:', err.message);
  }
};

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    await ensureDefaultAdmin();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Connection event listeners
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB error: ${err.message}`);
});

module.exports = connectDB;

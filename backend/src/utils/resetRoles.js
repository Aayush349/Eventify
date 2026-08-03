const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const resetRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Set all accounts except admin@admin.com to customer role
    const result = await User.updateMany(
      { email: { $ne: 'admin@admin.com' } },
      { $set: { role: 'customer' } }
    );
    console.log(`✅ Updated ${result.modifiedCount} user accounts back to 'customer' role.`);

    // Ensure admin@admin.com is admin
    await User.updateOne({ email: 'admin@admin.com' }, { $set: { role: 'admin' } });
    console.log("🛡️ Preserved 'admin@admin.com' as 'admin' role.");

    process.exit(0);
  } catch (err) {
    console.error('Error resetting roles:', err);
    process.exit(1);
  }
};

resetRoles();

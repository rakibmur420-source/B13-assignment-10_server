require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const existing = await User.findOne({ email: 'admin@fable.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const admin = new User({
    name: 'Fable Admin',
    email: 'admin@fable.com',
    password: hashedPassword,
    role: 'admin',
  });

  await admin.save();
  console.log('Admin created successfully!');
  process.exit(0);
}

createAdmin().catch(console.error);
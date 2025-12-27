// Direct Admin Creation Script (No server needed)
// Run: node create-admin-direct.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    }
  });
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'agent', 'operator', 'accountant', 'shopper', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in .env.local');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check for reset flag first
    const reset = process.argv.includes('--reset');
    
    // Get custom credentials from command line or use defaults
    const emailIndex = process.argv.indexOf('--email');
    const passwordIndex = process.argv.indexOf('--password');
    const nameIndex = process.argv.indexOf('--name');
    const phoneIndex = process.argv.indexOf('--phone');

    const adminEmail = emailIndex !== -1 ? process.argv[emailIndex + 1] : 'admin@8rupiya.com';
    const adminPassword = passwordIndex !== -1 ? process.argv[passwordIndex + 1] : 'admin123';
    const adminName = nameIndex !== -1 ? process.argv[nameIndex + 1] : 'Admin';
    const adminPhone = phoneIndex !== -1 ? process.argv[phoneIndex + 1] : '9999999999';
    
    // Check if admin exists (by role or email)
    const existingAdminByRole = await User.findOne({ role: 'admin' });
    const existingAdminByEmail = await User.findOne({ email: adminEmail.toLowerCase() });
    
    if (existingAdminByRole || existingAdminByEmail) {
      if (reset) {
        console.log('🗑️  Deleting existing admin(s)...');
        if (existingAdminByRole) {
          await User.deleteOne({ _id: existingAdminByRole._id });
          console.log(`   Deleted admin by role: ${existingAdminByRole.email}`);
        }
        if (existingAdminByEmail && existingAdminByEmail._id.toString() !== existingAdminByRole?._id.toString()) {
          await User.deleteOne({ _id: existingAdminByEmail._id });
          console.log(`   Deleted user with email: ${existingAdminByEmail.email}`);
        }
        console.log('✅ Existing admin(s) deleted');
      } else {
        console.log('\n⚠️  Admin user already exists:');
        if (existingAdminByRole) {
          console.log(`   Email: ${existingAdminByRole.email}`);
          console.log(`   Name: ${existingAdminByRole.name}`);
          console.log(`   Phone: ${existingAdminByRole.phone}`);
        }
        if (existingAdminByEmail && existingAdminByEmail._id.toString() !== existingAdminByRole?._id.toString()) {
          console.log(`\n⚠️  User with email ${adminEmail} already exists`);
        }
        console.log('\n💡 To create a new admin, use:');
        console.log('   node create-admin-direct.js --reset');
        await mongoose.disconnect();
        return;
      }
    }

    // Create admin user
    console.log('\n🔐 Creating admin user...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await User.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      phone: adminPhone,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Phone: ${admin.phone}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');
    console.log('\n🌐 Login URL: http://localhost:3000/login');

    await mongoose.disconnect();
    console.log('\n🎉 Done!');
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      console.error(`   User with this ${field} already exists.`);
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();


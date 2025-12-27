const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
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

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🔌 Connected to MongoDB...');

    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log('\n💡 To reset password, delete the admin user first or use the API endpoint.');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@8rupiya.com',
      phone: '9999999999',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log('\n⚠️  Please change the password after first login!');

    await mongoose.disconnect();
    console.log('\n🎉 Done!');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    if (error.code === 11000) {
      console.error('   User with this email already exists.');
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();


const mongoose = require('mongoose');

// Read MONGODB_URI from environment or use default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/8rupiya';

async function checkData() {
  try {
    console.log('Connecting to:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check collections
    const User = mongoose.connection.collection('users');
    const Shop = mongoose.connection.collection('shops');
    const Payment = mongoose.connection.collection('payments');
    const Plan = mongoose.connection.collection('plans');
    
    const userCount = await User.countDocuments();
    const shopCount = await Shop.countDocuments();
    const paymentCount = await Payment.countDocuments();
    const planCount = await Plan.countDocuments();
    
    console.log('=== Database Stats ===');
    console.log('Users:', userCount);
    console.log('Shops:', shopCount);
    console.log('Payments:', paymentCount);
    console.log('Plans:', planCount);
    
    // Check admin users
    const admins = await User.find({ role: 'admin' }).toArray();
    console.log('\nAdmins:', admins.length);
    
    // Check agents
    const agents = await User.find({ role: 'agent' }).toArray();
    console.log('Agents:', agents.length);
    
    // Check operators
    const operators = await User.find({ role: 'operator' }).toArray();
    console.log('Operators:', operators.length);
    
    // Check shops by status
    const activeShops = await Shop.countDocuments({ status: { $in: ['active', 'approved'] } });
    const pendingShops = await Shop.countDocuments({ status: 'pending' });
    console.log('\nActive Shops:', activeShops);
    console.log('Pending Shops:', pendingShops);
    
    // Check payments
    const successPayments = await Payment.find({ status: 'success' }).toArray();
    console.log('\nSuccessful Payments:', successPayments.length);
    if (successPayments.length > 0) {
      const totalRevenue = successPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      console.log('Total Revenue: ₹' + totalRevenue);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkData();

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/8rupiya';

async function testDashboardLogic() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const User = mongoose.connection.collection('users');
    const Shop = mongoose.connection.collection('shops');
    const Payment = mongoose.connection.collection('payments');
    
    // Test the same logic as dashboard API
    const totalShops = await Shop.countDocuments();
    console.log('Total Shops:', totalShops);
    
    const activeShops = await Shop.countDocuments({ 
      status: { $in: ['active', 'approved'] }
    });
    console.log('Active Shops:', activeShops);
    
    const agents = await User.countDocuments({ role: 'agent' });
    console.log('Agents:', agents);
    
    const operators = await User.countDocuments({ role: 'operator' });
    console.log('Operators:', operators);
    
    // Check payments
    const allPayments = await Payment.find({ status: 'success' }).toArray();
    console.log('\nTotal Successful Payments:', allPayments.length);
    
    // Get all shop IDs - use distinct on collection, not on cursor
    const existingShopIds = await Shop.distinct('_id');
    console.log('Existing Shop IDs count:', existingShopIds.length);
    
    const existingShopIdSet = new Set(existingShopIds.map(id => id.toString()));
    
    // Check which payments are linked to shops
    let validPaymentsCount = 0;
    let totalRevenue = 0;
    let orphanedPayments = [];
    
    allPayments.forEach(p => {
      if (p.shopId) {
        const shopIdStr = p.shopId.toString();
        if (existingShopIdSet.has(shopIdStr)) {
          validPaymentsCount++;
          totalRevenue += p.amount || 0;
        } else {
          orphanedPayments.push({ paymentId: p._id, shopId: shopIdStr, amount: p.amount });
        }
      } else {
        orphanedPayments.push({ paymentId: p._id, shopId: null, amount: p.amount });
      }
    });
    
    console.log('\nValid Payments (linked to existing shops):', validPaymentsCount);
    console.log('Total Revenue from valid payments:', totalRevenue);
    
    if (orphanedPayments.length > 0) {
      console.log('\n⚠️  Orphaned Payments:', orphanedPayments.length);
      orphanedPayments.forEach(op => {
        console.log(`  - Payment ${op.paymentId}: ₹${op.amount}, shopId: ${op.shopId || 'null'}`);
      });
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testDashboardLogic();

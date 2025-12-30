// Debug script to check commission data
// Run: node debug-commission.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function debugCommissions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get models
    const User = require('./src/models/User').default;
    const Shop = require('./src/models/Shop').default;
    const Payment = require('./src/models/Payment').default;
    const Commission = require('./src/models/Commission').default;
    const AgentRequest = require('./src/models/AgentRequest').default;

    // Find Khushi (operator)
    console.log('🔍 Searching for operator "Khushi"...');
    const khushi = await User.findOne({ 
      name: { $regex: /khushi/i }, 
      role: 'operator' 
    });
    
    if (!khushi) {
      console.log('❌ Operator Khushi not found');
      process.exit(1);
    }
    
    console.log(`✅ Found Operator: ${khushi.name} (${khushi.email})`);
    console.log(`   ID: ${khushi._id}\n`);

    // Find Afroz (agent)
    console.log('🔍 Searching for agent "Afroz"...');
    const afroz = await User.findOne({ 
      name: { $regex: /afroj|afroz/i }, 
      role: 'agent' 
    });
    
    if (!afroz) {
      console.log('❌ Agent Afroz/Afroj not found');
      process.exit(1);
    }
    
    console.log(`✅ Found Agent: ${afroz.name} (${afroz.email})`);
    console.log(`   ID: ${afroz._id}\n`);

    // Check AgentRequest
    console.log('🔍 Checking Agent Request...');
    const agentRequest = await AgentRequest.findOne({
      operatorId: khushi._id,
      agentId: afroz._id
    });
    
    if (agentRequest) {
      console.log(`✅ Agent Request exists: Status = ${agentRequest.status}`);
      if (agentRequest.status !== 'approved') {
        console.log(`⚠️  WARNING: Request is ${agentRequest.status}, not approved!`);
      }
    } else {
      console.log('❌ No Agent Request found between Khushi and Afroz');
      console.log('   This means they are not linked in the system!\n');
      console.log('💡 Solution: Operator needs to add agent through /operator/agents page');
    }
    console.log('');

    // Find Afroz's shops
    console.log('🔍 Searching for shops created by Afroz...');
    const shops = await Shop.find({ agentId: afroz._id });
    console.log(`📦 Found ${shops.length} shops\n`);
    
    if (shops.length === 0) {
      console.log('❌ No shops found for agent Afroz');
      process.exit(1);
    }

    shops.forEach((shop, index) => {
      console.log(`Shop ${index + 1}:`);
      console.log(`   Name: ${shop.name}`);
      console.log(`   Status: ${shop.status}`);
      console.log(`   AgentId: ${shop.agentId}`);
      console.log(`   OperatorId: ${shop.operatorId || 'NOT SET ⚠️'}`);
      console.log('');
    });

    // Check payments
    console.log('🔍 Checking payments for these shops...');
    const shopIds = shops.map(s => s._id);
    const payments = await Payment.find({ 
      shopId: { $in: shopIds },
      status: 'success'
    });
    
    console.log(`💰 Found ${payments.length} successful payments\n`);
    
    if (payments.length === 0) {
      console.log('❌ No successful payments found');
      console.log('   Commission is ₹0 because there are no payments yet\n');
      process.exit(0);
    }

    let totalAmount = 0;
    payments.forEach((payment, index) => {
      totalAmount += payment.amount;
      console.log(`Payment ${index + 1}:`);
      console.log(`   Amount: ₹${payment.amount}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Date: ${payment.createdAt}`);
      console.log('');
    });

    console.log(`💵 Total Payment Amount: ₹${totalAmount}\n`);

    // Check commissions
    console.log('🔍 Checking commission records...');
    const paymentIds = payments.map(p => p._id);
    const commissions = await Commission.find({ 
      paymentId: { $in: paymentIds }
    });
    
    console.log(`📊 Found ${commissions.length} commission records\n`);

    if (commissions.length === 0) {
      console.log('❌ No commission records found!');
      console.log('   This is why commission is ₹0\n');
      console.log('💡 Solution: Click "Sync Commissions" button on admin dashboard');
      console.log('   Or run: POST /api/admin/sync-all-commissions\n');
      process.exit(0);
    }

    let totalAgentCommission = 0;
    let totalOperatorCommission = 0;
    let totalCompanyRevenue = 0;

    commissions.forEach((comm, index) => {
      console.log(`Commission ${index + 1}:`);
      console.log(`   AgentId: ${comm.agentId || 'NOT SET'}`);
      console.log(`   OperatorId: ${comm.operatorId || 'NOT SET ⚠️'}`);
      console.log(`   Agent Amount: ₹${comm.agentAmount}`);
      console.log(`   Operator Amount: ₹${comm.operatorAmount}`);
      console.log(`   Company Amount: ₹${comm.companyAmount}`);
      console.log(`   Status: ${comm.status}`);
      console.log('');

      totalAgentCommission += comm.agentAmount;
      totalOperatorCommission += comm.operatorAmount;
      totalCompanyRevenue += comm.companyAmount;
    });

    console.log('📈 SUMMARY:');
    console.log(`   Total Payment Amount: ₹${totalAmount}`);
    console.log(`   Agent Commission (20%): ₹${totalAgentCommission}`);
    console.log(`   Operator Commission (10% of remaining): ₹${totalOperatorCommission}`);
    console.log(`   Company Revenue: ₹${totalCompanyRevenue}`);
    console.log('');

    // Check if operatorId is set correctly
    const commissionsWithoutOperator = commissions.filter(c => !c.operatorId);
    if (commissionsWithoutOperator.length > 0) {
      console.log(`⚠️  WARNING: ${commissionsWithoutOperator.length} commissions don't have operatorId set!`);
      console.log('   This means operator commission is not being calculated\n');
      console.log('💡 Solution: Click "Sync Commissions" button to fix this');
    }

    // Check if shops have operatorId set
    const shopsWithoutOperator = shops.filter(s => !s.operatorId);
    if (shopsWithoutOperator.length > 0) {
      console.log(`⚠️  WARNING: ${shopsWithoutOperator.length} shops don't have operatorId set!`);
      console.log('   Shop names:', shopsWithoutOperator.map(s => s.name).join(', '));
      console.log('   This will cause commission issues\n');
      console.log('💡 Solution: Click "Sync Commissions" button to auto-fix');
    }

    console.log('\n✅ Debug complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugCommissions();


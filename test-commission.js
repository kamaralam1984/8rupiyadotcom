// Commission Calculation Test
// Run: node test-commission.js

function calculateCommission(paymentAmount, agentId, operatorId) {
  const totalAmount = paymentAmount;
  
  // Agent gets 20%
  const agentAmount = agentId ? totalAmount * 0.2 : 0;
  
  // Remaining after agent
  const remaining = totalAmount - agentAmount;
  
  // Operator gets 10% of remaining (80%)
  const operatorAmount = operatorId ? remaining * 0.1 : 0;
  
  // Company gets the rest
  const companyAmount = totalAmount - agentAmount - operatorAmount;

  return {
    agentAmount: Math.round(agentAmount * 100) / 100,
    operatorAmount: Math.round(operatorAmount * 100) / 100,
    companyAmount: Math.round(companyAmount * 100) / 100,
    totalAmount,
  };
}

// Test Cases
console.log('\n🧪 Commission Calculation Tests\n');
console.log('═'.repeat(70));

const testCases = [
  { amount: 100, description: 'Small Payment' },
  { amount: 499, description: 'Starter Plan' },
  { amount: 999, description: 'Basic Plan' },
  { amount: 1999, description: 'Pro Plan' },
  { amount: 4999, description: 'Business Plan' },
  { amount: 9999, description: 'Enterprise Plan' },
  { amount: 1000, description: 'Round Number' },
  { amount: 5000, description: 'Large Payment' },
];

testCases.forEach(({ amount, description }) => {
  const result = calculateCommission(amount, 'agent123', 'operator456');
  
  console.log(`\n💰 ${description} - Payment: ₹${amount}`);
  console.log('─'.repeat(70));
  console.log(`   Agent Commission (20%):      ₹${result.agentAmount.toFixed(2)}`);
  console.log(`   Remaining after Agent:       ₹${(amount - result.agentAmount).toFixed(2)}`);
  console.log(`   Operator Commission (10%):   ₹${result.operatorAmount.toFixed(2)}`);
  console.log(`   Company Revenue:             ₹${result.companyAmount.toFixed(2)}`);
  console.log(`   ─────────────────────────────────────`);
  console.log(`   Total Verification:          ₹${(result.agentAmount + result.operatorAmount + result.companyAmount).toFixed(2)}`);
  
  // Verify total matches
  const total = result.agentAmount + result.operatorAmount + result.companyAmount;
  const isCorrect = Math.abs(total - amount) < 0.01;
  console.log(`   Status: ${isCorrect ? '✅ CORRECT' : '❌ ERROR'}`);
});

console.log('\n' + '═'.repeat(70));
console.log('\n📊 Formula Summary:');
console.log('   1. Agent Commission = 20% of Total Payment');
console.log('   2. Remaining = Total Payment - Agent Commission');
console.log('   3. Operator Commission = 10% of Remaining');
console.log('   4. Company Revenue = Remaining - Operator Commission');
console.log('\n   Example: ₹100 payment');
console.log('   → Agent: ₹20 (20% of 100)');
console.log('   → Remaining: ₹80 (100 - 20)');
console.log('   → Operator: ₹8 (10% of 80)');
console.log('   → Company: ₹72 (80 - 8)');
console.log('   → Total: ₹100 ✅');
console.log('\n' + '═'.repeat(70) + '\n');

// Test without agent (no agent commission)
console.log('\n🔍 Special Cases:\n');
console.log('─'.repeat(70));

const noAgent = calculateCommission(1000, null, 'operator456');
console.log('\n💼 No Agent (Direct Shop):');
console.log(`   Payment: ₹1000`);
console.log(`   Agent Commission: ₹${noAgent.agentAmount}`);
console.log(`   Operator Commission: ₹${noAgent.operatorAmount}`);
console.log(`   Company Revenue: ₹${noAgent.companyAmount}`);

const noOperator = calculateCommission(1000, 'agent123', null);
console.log('\n💼 No Operator:');
console.log(`   Payment: ₹1000`);
console.log(`   Agent Commission: ₹${noOperator.agentAmount}`);
console.log(`   Operator Commission: ₹${noOperator.operatorAmount}`);
console.log(`   Company Revenue: ₹${noOperator.companyAmount}`);

const noAgentOrOperator = calculateCommission(1000, null, null);
console.log('\n💼 No Agent or Operator:');
console.log(`   Payment: ₹1000`);
console.log(`   Agent Commission: ₹${noAgentOrOperator.agentAmount}`);
console.log(`   Operator Commission: ₹${noAgentOrOperator.operatorAmount}`);
console.log(`   Company Revenue: ₹${noAgentOrOperator.companyAmount}`);

console.log('\n' + '─'.repeat(70) + '\n');


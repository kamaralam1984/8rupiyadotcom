#!/bin/bash
# Quick check script for Khushi-Afroz commission issue

echo "🔍 Checking Khushi and Afroz data..."
echo ""

# Open MongoDB shell and run queries
mongosh "$MONGODB_URI" --eval '
console.log("1️⃣ Finding Operator Khushi...");
db.users.findOne({name: /khushi/i, role: "operator"}, {name: 1, email: 1, role: 1});

console.log("\n2️⃣ Finding Agent Afroz...");
db.users.findOne({name: /afroz|afroj/i, role: "agent"}, {name: 1, email: 1, role: 1});

console.log("\n3️⃣ Checking Agent Request...");
var khushi = db.users.findOne({name: /khushi/i, role: "operator"});
var afroz = db.users.findOne({name: /afroz|afroj/i, role: "agent"});

if (khushi && afroz) {
  var request = db.agentrequests.findOne({
    operatorId: khushi._id,
    agentId: afroz._id
  });
  
  if (request) {
    console.log("✅ Request found: Status =", request.status);
  } else {
    console.log("❌ NO REQUEST FOUND!");
    console.log("💡 Operator needs to add agent first!");
  }
  
  console.log("\n4️⃣ Checking Afroz shops...");
  var shops = db.shops.find({agentId: afroz._id}).toArray();
  console.log("Found", shops.length, "shops");
  
  if (shops.length > 0) {
    shops.forEach(function(shop) {
      console.log("  -", shop.name, "| operatorId:", shop.operatorId || "NOT SET ⚠️");
    });
    
    console.log("\n5️⃣ Checking payments...");
    var shopIds = shops.map(function(s) { return s._id; });
    var payments = db.payments.find({
      shopId: {$in: shopIds},
      status: "success"
    }).toArray();
    
    console.log("Found", payments.length, "successful payments");
    var totalAmount = 0;
    payments.forEach(function(p) {
      totalAmount += p.amount;
    });
    console.log("Total Amount: ₹" + totalAmount);
    
    console.log("\n6️⃣ Checking commissions...");
    var paymentIds = payments.map(function(p) { return p._id; });
    var commissions = db.commissions.find({
      paymentId: {$in: paymentIds}
    }).toArray();
    
    console.log("Found", commissions.length, "commission records");
    
    if (commissions.length === 0) {
      console.log("❌ NO COMMISSIONS FOUND!");
      console.log("💡 Click SYNC COMMISSIONS button!");
    } else {
      var totalOp = 0;
      commissions.forEach(function(c) {
        console.log("  - operatorId:", c.operatorId || "NOT SET ⚠️", 
                    "| operatorAmount: ₹" + c.operatorAmount);
        totalOp += c.operatorAmount;
      });
      console.log("\n📊 Total Operator Commission: ₹" + totalOp);
      
      if (totalOp === 0) {
        console.log("⚠️  Commission is ₹0 - operatorId not set properly!");
        console.log("💡 Click SYNC COMMISSIONS to fix!");
      }
    }
  } else {
    console.log("❌ No shops found for agent!");
  }
}
'


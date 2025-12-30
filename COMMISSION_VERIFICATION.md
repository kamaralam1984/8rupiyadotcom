# Commission Calculation Verification

## ✅ Formula Implementation (CORRECT)

### Current Implementation:
```
Payment Amount: ₹100
├─ Agent Commission: 20% of ₹100 = ₹20
├─ Remaining: ₹100 - ₹20 = ₹80
├─ Operator Commission: 10% of ₹80 = ₹8
└─ Company Revenue: ₹80 - ₹8 = ₹72

Total Check: ₹20 + ₹8 + ₹72 = ₹100 ✅
```

### Code Location:
**File**: `src/lib/commission.ts`
**Function**: `calculateCommission()`

```typescript
// Step 1: Agent gets 20% of total
const agentAmount = agentId ? totalAmount * 0.2 : 0;

// Step 2: Calculate remaining after agent
const remaining = totalAmount - agentAmount;

// Step 3: Operator gets 10% of remaining
const operatorAmount = operatorId ? remaining * 0.1 : 0;

// Step 4: Company gets the rest
const companyAmount = totalAmount - agentAmount - operatorAmount;
```

---

## 📊 Example Calculations

### Example 1: ₹100 Payment
```
Payment:   ₹100
Agent:     ₹20  (20% of 100)
Remaining: ₹80  (100 - 20)
Operator:  ₹8   (10% of 80)
Company:   ₹72  (80 - 8)
```

### Example 2: ₹1000 Payment
```
Payment:   ₹1000
Agent:     ₹200  (20% of 1000)
Remaining: ₹800  (1000 - 200)
Operator:  ₹80   (10% of 800)
Company:   ₹720  (800 - 80)
```

### Example 3: ₹5000 Payment
```
Payment:   ₹5000
Agent:     ₹1000 (20% of 5000)
Remaining: ₹4000 (5000 - 1000)
Operator:  ₹400  (10% of 4000)
Company:   ₹3600 (4000 - 400)
```

### Example 4: ₹499 Payment (Starter Plan)
```
Payment:   ₹499
Agent:     ₹99.80  (20% of 499)
Remaining: ₹399.20 (499 - 99.80)
Operator:  ₹39.92  (10% of 399.20)
Company:   ₹359.28 (399.20 - 39.92)
```

---

## 🔄 When Commission is Calculated

### 1. During Payment Verification (Razorpay)
**File**: `src/app/api/payments/verify/route.ts`
```typescript
// After successful payment verification
await createCommission(payment._id.toString(), shop._id.toString());
```

### 2. During Cash Payment
**File**: `src/app/api/payments/cash/route.ts`
```typescript
// After cash payment creation
await createCommission(payment._id.toString(), shop._id.toString());
```

### 3. On User Login (Background Sync)
**File**: `src/app/api/auth/login/route.ts`
```typescript
// Syncs any missing commissions
syncUserCommissions(user._id.toString(), user.role).catch(console.error);
```

---

## 🗄️ Commission Storage

### Database Model: `Commission`
```typescript
{
  paymentId: ObjectId,      // Reference to Payment
  shopId: ObjectId,          // Reference to Shop
  agentId: ObjectId,         // Reference to Agent User
  operatorId: ObjectId,      // Reference to Operator User
  agentAmount: Number,       // ₹20 (for ₹100 payment)
  operatorAmount: Number,    // ₹8 (for ₹100 payment)
  companyAmount: Number,     // ₹72 (for ₹100 payment)
  totalAmount: Number,       // ₹100
  status: String,            // 'pending' | 'paid' | 'cancelled'
  createdAt: Date
}
```

---

## 📱 Display Locations

### 1. Admin Dashboard
**File**: `src/components/admin/AdminDashboard.tsx`
**API**: `/api/admin/dashboard`
- Total Agent Commission
- Total Operator Commission
- Total Company Revenue

### 2. Agent Dashboard
**File**: `src/components/agent/AgentDashboard.tsx`
**API**: `/api/agent/dashboard`
- Agent's Total Commission (20% of their shops)
- Agent's Shop Performance

### 3. Operator Dashboard
**File**: `src/components/operator/OperatorDashboard.tsx`
**API**: `/api/operator/dashboard`
- Operator's Total Commission (10% of remaining)
- Per-Agent Commission Breakdown

### 4. Commission Management Page
**File**: `src/components/admin/CommissionManagementPage.tsx`
**API**: `/api/admin/commissions`
- Detailed Commission Table
- Pie Chart Distribution
- Export to CSV

---

## 🔧 Troubleshooting

### If Operator Commission Shows 0:

**Possible Reasons:**
1. Shop doesn't have `operatorId` set
2. Commission record wasn't created
3. Old payments before operatorId was assigned

**Solution:**
Run the fix-commissions endpoint:
```bash
POST /api/admin/fix-commissions
```

This will:
- Find commissions with missing operatorId
- Look up operator from AgentRequest
- Recalculate commission with correct formula
- Update commission records

### Manual Verification:

**Step 1: Check Commission Records**
```bash
# MongoDB Query
db.commissions.find().pretty()
```

**Step 2: Verify Calculation**
```javascript
// Example commission record
{
  paymentId: "...",
  agentAmount: 20,      // Should be 20% of payment
  operatorAmount: 8,    // Should be 10% of (payment - agent)
  companyAmount: 72,    // Should be remaining
  totalAmount: 100
}
```

**Step 3: Check Shop has operatorId**
```bash
# MongoDB Query
db.shops.find({ operatorId: { $exists: false } })
```

---

## ✅ Verification Checklist

- [x] Formula is correct: Agent 20%, Operator 10% of remaining
- [x] `calculateCommission()` function implemented correctly
- [x] Commission created on payment success
- [x] Commission synced on user login
- [x] Fix-commissions endpoint available
- [x] Commission displayed on all dashboards
- [x] Export functionality available

---

## 🚀 API Endpoints

### Get Commissions
```
GET /api/admin/commissions
GET /api/agent/dashboard (includes agent commissions)
GET /api/operator/dashboard (includes operator commissions)
```

### Get Commission Stats
```
GET /api/admin/commissions/stats
```

### Mark Commission as Paid
```
POST /api/admin/commissions/[id]/mark-paid
```

### Export Commissions
```
GET /api/admin/commissions/export
```

### Fix Historical Commissions
```
POST /api/admin/fix-commissions
```

---

## 📈 Performance

- Uses MongoDB aggregation for calculations
- Indexed on `agentId`, `operatorId`, `status`
- Background sync on login (non-blocking)
- Efficient queries with population

---

## 🔒 Security

- All endpoints protected with JWT
- Role-based access control
- Only Admin can mark as paid
- Only Admin can fix commissions
- Audit trail via createdAt

---

**Formula Status**: ✅ CORRECT  
**Implementation Status**: ✅ COMPLETE  
**Last Verified**: December 30, 2025




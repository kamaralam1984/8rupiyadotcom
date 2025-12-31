# 🚀 Razorpay Setup - Quick Guide

## ⚠️ Current Status

```bash
❌ Razorpay API keys NOT configured
```

**Your payment system is READY but needs API keys to work!**

---

## ✅ 5-Minute Setup

### **Step 1: Get Razorpay Account** (2 minutes)

1. Visit: **https://dashboard.razorpay.com/signup**
2. Sign up with:
   - Email
   - Phone number
   - Business details

### **Step 2: Get API Keys** (1 minute)

#### **For Testing:**
1. Login to Razorpay Dashboard
2. Go to: **Settings** → **API Keys**
3. Click: **Generate Test Keys**
4. Copy:
   - Key ID: `rzp_test_XXXXXXXXXXXXXXXX`
   - Key Secret: `YYYYYYYYYYYYYYYYYYYYYY`

#### **For Production (Live):**
1. Complete KYC verification
2. Go to: **Settings** → **API Keys**  
3. Switch to **Live Mode**
4. Click: **Generate Live Keys**
5. Copy both keys

### **Step 3: Add to .env File** (30 seconds)

Open your `.env` file and add:

```bash
# Razorpay Test Keys (for development)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYYYYYYYY

# When going live, replace with:
# RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
# RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYYYYYYYY
```

### **Step 4: Restart Server** (30 seconds)

```bash
# Stop server (Ctrl+C)
npm run dev
```

### **Step 5: Test Payment** (1 minute)

1. Go to any shop page
2. Click "Subscribe to Plan"
3. Click "Pay Now"
4. Use test card:
   ```
   Card Number: 4111 1111 1111 1111
   CVV: 123
   Expiry: 12/25
   Name: Test User
   ```
5. Payment should succeed!

---

## 🎯 Test Cards (Razorpay Test Mode)

### **Success:**
```
Card: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
Name: Any name
OTP: Will not be asked in test mode
```

### **Failure:**
```
Card: 4000 0000 0000 0002
CVV: Any 3 digits  
Expiry: Any future date
```

### **Test UPI:**
```
UPI ID: success@razorpay
Amount: Any
```

---

## 📱 Mobile & Desktop Testing

### **What Works:**

✅ **Desktop (All Browsers):**
- Credit/Debit cards
- Net Banking
- UPI (QR Code)
- Wallets

✅ **Mobile (Android/iOS):**
- All desktop methods
- **Plus:** UPI apps (GPay, PhonePe, Paytm)
- Direct app opening
- Faster checkout

---

## 🔐 Security

### **What's Protected:**

✅ **Card details** - Never touch your server
✅ **Payment signature** - Server-side verification
✅ **PCI Compliance** - Razorpay handles it
✅ **SSL Encryption** - All data encrypted

---

## 💰 Pricing

### **Razorpay Fees:**

**Test Mode:** FREE (unlimited testing)

**Live Mode:**
- **Domestic Cards:** 2% per transaction
- **UPI:** 1% per transaction  
- **Net Banking:** 2% per transaction
- **Wallets:** 2% per transaction

**No setup fees, no annual fees!**

---

## 🎉 After Setup

### **What Happens:**

1. **Test Payments Work** ✅
   - Users can make test payments
   - Shop gets activated
   - Commissions created

2. **Mobile Works** ✅
   - UPI apps open automatically
   - Cards work smoothly
   - Great user experience

3. **Desktop Works** ✅
   - All payment methods available
   - Professional checkout
   - Secure process

---

## 🚨 Common Issues

### **Issue: "Razorpay key not configured"**
**Solution:** Add keys to `.env` file and restart server

### **Issue: Payment modal not opening**
**Solution:** Check internet connection, clear browser cache

### **Issue: Test card not working**
**Solution:** Ensure using test keys, not live keys

---

## 📝 Quick Reference

### **Razorpay Dashboard:**
https://dashboard.razorpay.com/

### **Test Mode vs Live Mode:**

| Feature | Test Mode | Live Mode |
|---------|-----------|-----------|
| **Real Money** | ❌ No | ✅ Yes |
| **Test Cards** | ✅ Works | ❌ Won't work |
| **Real Cards** | ❌ Won't work | ✅ Works |
| **Settlement** | ❌ No | ✅ 2-3 days |
| **Cost** | FREE | 2% + GST |

---

## ✅ Checklist

- [ ] Signed up on Razorpay
- [ ] Generated Test API keys
- [ ] Added keys to `.env` file
- [ ] Restarted development server
- [ ] Tested payment with test card
- [ ] Payment succeeded
- [ ] Shop got activated
- [ ] Tested on mobile device
- [ ] Tested on desktop browser
- [ ] Ready for production!

---

## 🚀 Go Live (When Ready)

### **Before Going Live:**

1. **Complete KYC**
   - Submit business documents
   - Wait for approval (1-2 days)

2. **Generate Live Keys**
   - Switch to Live mode in dashboard
   - Generate new keys

3. **Replace in .env**
   ```bash
   RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYYYYYYYY
   ```

4. **Test with Small Amount**
   - Make ₹1 or ₹10 payment
   - Verify it works
   - Check money received

5. **Go Live!**
   - Deploy to production
   - Monitor first transactions
   - Celebrate! 🎉

---

## 📞 Support

**Razorpay Support:**
- Email: support@razorpay.com
- Phone: +91 80-6910-0000
- Chat: Available in dashboard

**Documentation:**
- https://razorpay.com/docs/

---

**Status:** ⚠️ Needs API Keys  
**Time to Setup:** 5 minutes  
**Difficulty:** Easy  
**Cost:** FREE (test mode)

**Once setup, payments will work perfectly on mobile and desktop!** 💳✨


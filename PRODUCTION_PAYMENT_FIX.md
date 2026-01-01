# 🚨 Production Payment Issue Fix

## ❌ Problem

**Localhost**: Payment working ✅  
**Domain (8rupiya.com)**: Payment NOT working ❌

**Error**: "Failed to create payment order: Please try again"

---

## 🔍 Root Cause

**Production server mein Razorpay environment variables set nahi hain!**

### **Localhost has:**
```bash
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

### **Production (8rupiya.com) needs:**
```bash
RAZORPAY_KEY_ID=rzp_live_xxxxx  (or rzp_test_xxxxx)
RAZORPAY_KEY_SECRET=xxxxx
```

---

## ✅ Solution Steps

### **Step 1: Check Your Hosting Platform**

आपका domain कहाँ host है? Choose one:

#### **A. Vercel** (Most common)
#### **B. Netlify**
#### **C. Custom Server (VPS/Cloud)**
#### **D. cPanel/Shared Hosting**

---

## 🔧 Fix for Each Platform

### **A. VERCEL (Recommended)**

#### **1.1 Login to Vercel:**
```
https://vercel.com/
```

#### **1.2 Go to Your Project:**
- Find: `8rupiyadotcom` project
- Click on it

#### **1.3 Go to Settings:**
- Click **"Settings"** tab (top)

#### **1.4 Add Environment Variables:**
- Click **"Environment Variables"** (left sidebar)
- Add these variables:

```
Name: RAZORPAY_KEY_ID
Value: rzp_test_your_key_here  (or rzp_live for production)
Environment: Production ✓

Name: RAZORPAY_KEY_SECRET
Value: your_secret_here
Environment: Production ✓
```

#### **1.5 Redeploy:**
- Go to **"Deployments"** tab
- Click **"..."** (three dots) on latest deployment
- Click **"Redeploy"**
- Wait for deployment to complete (1-2 minutes)

#### **1.6 Test:**
```
https://8rupiya.com/shopper/shops/new
```

---

### **B. NETLIFY**

#### **2.1 Login to Netlify:**
```
https://app.netlify.com/
```

#### **2.2 Go to Your Site:**
- Find: `8rupiya` site
- Click on it

#### **2.3 Go to Site Configuration:**
- Click **"Site configuration"** (left sidebar)

#### **2.4 Add Environment Variables:**
- Click **"Environment variables"**
- Click **"Add a variable"**
- Add:

```
Key: RAZORPAY_KEY_ID
Value: rzp_test_your_key_here
Scopes: All

Key: RAZORPAY_KEY_SECRET
Value: your_secret_here
Scopes: All
```

#### **2.5 Redeploy:**
- Go to **"Deploys"**
- Click **"Trigger deploy"** → **"Deploy site"**
- Wait for deployment (1-2 minutes)

---

### **C. CUSTOM SERVER (VPS/Cloud)**

#### **3.1 SSH into Server:**
```bash
ssh your-user@your-server-ip
```

#### **3.2 Find Your Project:**
```bash
cd /path/to/8rupiyadotcom
```

#### **3.3 Edit .env File:**
```bash
nano .env  # or vim .env
```

#### **3.4 Add Variables:**
```bash
# Razorpay Configuration (Production)
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
```

#### **3.5 Save and Exit:**
```bash
# For nano: Ctrl+X, then Y, then Enter
# For vim: :wq
```

#### **3.6 Restart Application:**
```bash
# If using PM2:
pm2 restart 8rupiyadotcom

# If using systemd:
sudo systemctl restart 8rupiyadotcom

# If using Docker:
docker-compose restart
```

---

### **D. cPANEL/SHARED HOSTING**

#### **4.1 Login to cPanel:**
```
https://your-domain.com/cpanel
```

#### **4.2 Find File Manager:**
- Click **"File Manager"**

#### **4.3 Navigate to Project:**
```
/home/username/public_html/8rupiyadotcom/
```

#### **4.4 Edit .env File:**
- Right-click `.env` → **"Edit"**
- Add:

```bash
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
```

#### **4.5 Save:**
- Click **"Save Changes"**

#### **4.6 Restart Node App:**
- Go to cPanel dashboard
- Find **"Setup Node.js App"**
- Click **"Restart"** button

---

## 🔑 Get Razorpay Keys

### **Step 1: Login to Razorpay Dashboard:**
```
https://dashboard.razorpay.com/
```

### **Step 2: Go to Settings:**
- Click **"Settings"** (bottom left)

### **Step 3: API Keys:**
- Click **"API Keys"** (left sidebar)

### **Step 4: Generate Keys:**

#### **For Testing (Use on staging/test domains):**
```
Mode: Test Mode (top right toggle should be OFF)
Click: "Generate Test Keys"

You'll get:
Key ID: rzp_test_XXXXXXXXXXXXXXXX
Key Secret: YYYYYYYYYYYYYYYYYYYYYY
```

#### **For Production (Use on live domain):**
```
Mode: Live Mode (top right toggle should be ON)
Click: "Generate Live Keys"

You'll get:
Key ID: rzp_live_XXXXXXXXXXXXXXXX
Key Secret: YYYYYYYYYYYYYYYYYYYYYY
```

### **Step 5: Copy Keys:**
- Copy both Key ID and Secret
- Use in your environment variables

---

## 🌐 Whitelist Domain in Razorpay

### **Important: Add your domain to Razorpay!**

#### **Step 1: Go to Razorpay Dashboard:**
```
https://dashboard.razorpay.com/
```

#### **Step 2: Settings → Webhooks:**
- Click **"Settings"** → **"Webhooks"**

#### **Step 3: Add Domain:**
- Add: `https://8rupiya.com`
- Also add: `https://www.8rupiya.com` (if using www)

#### **Step 4: Enable Payment Methods:**
- Go to **"Settings"** → **"Payment Methods"**
- Enable:
  - ✅ UPI
  - ✅ Cards
  - ✅ Net Banking
  - ✅ Wallets

---

## 🔒 HTTPS Requirement

**Razorpay REQUIRES HTTPS for production!**

### **Check if your domain has HTTPS:**
```
✅ Good: https://8rupiya.com
❌ Bad:  http://8rupiya.com
```

### **If no HTTPS:**

#### **For Vercel/Netlify:**
- Automatic HTTPS (no action needed)

#### **For Custom Server:**
```bash
# Install Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx

# Get SSL Certificate
sudo certbot --nginx -d 8rupiya.com -d www.8rupiya.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 🧪 Testing After Fix

### **Step 1: Clear Browser Cache:**
```
Ctrl + Shift + Del (Clear cache)
Or use Incognito mode
```

### **Step 2: Go to Domain:**
```
https://8rupiya.com/shopper/shops/new
```

### **Step 3: Complete Steps 1-3:**
- Select plan
- Fill shop details
- Upload images

### **Step 4: Click "Create Shop & Pay Online":**

**Success होगा तो:**
```
✅ Payment order created
✅ Razorpay checkout opens
✅ Payment options visible (UPI, Card, etc.)
```

**Failure होगा तो:**
```
❌ "Failed to create payment order"
❌ Check server logs
❌ Check environment variables
```

---

## 📊 Debug Commands

### **Check if Environment Variables are Set:**

#### **For Vercel:**
```bash
# In project settings → Environment Variables
# Should see:
✅ RAZORPAY_KEY_ID
✅ RAZORPAY_KEY_SECRET
```

#### **For Custom Server:**
```bash
# SSH into server
cd /path/to/project

# Check .env file
cat .env | grep RAZORPAY

# Should show:
# RAZORPAY_KEY_ID=rzp_test_xxxxx
# RAZORPAY_KEY_SECRET=xxxxx
```

### **Check Server Logs:**

#### **For Vercel:**
```
Dashboard → Functions → Logs
Look for errors in /api/payments/create-order
```

#### **For Custom Server:**
```bash
# PM2 logs
pm2 logs 8rupiyadotcom

# Docker logs
docker-compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🚨 Common Errors & Solutions

### **Error 1: "Razorpay credentials not configured"**
```
Solution:
- Add RAZORPAY_KEY_ID to production env
- Add RAZORPAY_KEY_SECRET to production env
- Redeploy application
```

### **Error 2: "Invalid API Key"**
```
Solution:
- Check if key is correct (starts with rzp_test_ or rzp_live_)
- No spaces before/after key
- Copied correctly from Razorpay dashboard
```

### **Error 3: "Payment gateway not configured"**
```
Solution:
- Check /api/payments/razorpay-key endpoint
- Ensure RAZORPAY_KEY_ID is accessible from API
- Redeploy after adding env vars
```

### **Error 4: CORS Error**
```
Solution:
- Add domain to Razorpay dashboard
- Settings → Webhooks → Add domain
- Enable HTTPS on domain
```

### **Error 5: "net::ERR_FAILED"**
```
Solution:
- Check HTTPS is enabled
- Check API endpoint is accessible
- Check firewall/security rules
```

---

## ✅ Verification Checklist

- [ ] Razorpay account created
- [ ] API keys generated (Test or Live)
- [ ] Environment variables added to hosting platform
- [ ] Application redeployed
- [ ] Domain whitelisted in Razorpay
- [ ] HTTPS enabled on domain
- [ ] Payment methods enabled in Razorpay
- [ ] Browser cache cleared
- [ ] Tested payment on domain
- [ ] Payment order creates successfully
- [ ] Razorpay checkout opens
- [ ] Can complete test payment

---

## 📞 Quick Help

### **Still Not Working?**

#### **1. Check Server Logs:**
Look for errors in `/api/payments/create-order`

#### **2. Test API Directly:**
```bash
# Replace with your domain and token
curl -X POST https://8rupiya.com/api/payments/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"shopId":"SHOP_ID","planId":"PLAN_ID"}'
```

#### **3. Compare Environments:**
```
Localhost working → Production not working
= Environment variables missing on production
```

---

## 🎯 Most Common Fix (90% cases)

### **For Vercel Users:**

```
1. Vercel Dashboard → Project → Settings
2. Environment Variables
3. Add:
   RAZORPAY_KEY_ID = rzp_test_xxxxx
   RAZORPAY_KEY_SECRET = xxxxx
4. Deployments → Redeploy
5. Wait 2 minutes
6. Test on domain
7. ✅ Working!
```

---

## 📝 Summary

**Problem**: Environment variables are set in `.env.local` (for localhost) but NOT in production environment.

**Solution**: Add Razorpay environment variables to your hosting platform's environment configuration.

**Time Needed**: 5-10 minutes

**Difficulty**: Easy (just copy-paste environment variables)

---

**🎉 Follow the steps for your hosting platform and payment will work on domain too! 💳**


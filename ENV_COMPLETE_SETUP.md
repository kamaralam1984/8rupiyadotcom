# 🔐 Complete Environment Setup Guide - 8rupiya.com
## Full API Keys & Configuration

---

## 📋 Overview

Is document me sabhi environment variables aur API keys ki complete jankari hai jo GOLU ke advanced features ke liye zaroori hain.

---

## 🚀 .env.local Configuration

### **Copy this to your `.env.local` file:**

```env
# ================================================
# DATABASE CONFIGURATION (REQUIRED)
# ================================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/8rupiya
REDIS_URL=redis://localhost:6379

# ================================================
# AUTHENTICATION & SECURITY (REQUIRED)
# ================================================
JWT_SECRET=your_jwt_secret_min_32_characters
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# ================================================
# GOOGLE APIS - GOLU BRAIN (REQUIRED)
# ================================================

# Gemini AI - Main GOLU brain
GEMINI_API_KEY=AIzaSy...your_actual_key
NEXT_PUBLIC_AI_PROVIDER=gemini

# Google Translate - Multilingual support
GOOGLE_TRANSLATE_API_KEY=AIzaSy...your_key

# Google Maps - Location & Navigation
GOOGLE_MAPS_API_KEY=AIzaSy...your_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your_key

# Google Search - Web search capability
GOOGLE_SEARCH_API_KEY=AIzaSy...your_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id

# Google Places - Nearby places
GOOGLE_PLACES_API_KEY=AIzaSy...your_key

# Google Business Profile API - For admin panel Google Business account creation
GOOGLE_BUSINESS_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_BUSINESS_CLIENT_SECRET=your_client_secret_here

# ================================================
# WEATHER API (REQUIRED for weather features)
# ================================================
OPENWEATHER_API_KEY=your_openweather_key
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key

# ================================================
# NEWS API (Optional)
# ================================================
NEWS_API_KEY=your_news_api_key
NEXT_PUBLIC_NEWS_API_KEY=your_news_api_key

# ================================================
# PAYMENT GATEWAY (REQUIRED for commerce)
# ================================================
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...

# ================================================
# EMAIL SERVICES (REQUIRED for notifications)
# ================================================
SENDGRID_API_KEY=SG.your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@8rupiya.com

# Or SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password

# ================================================
# SMS/WHATSAPP (REQUIRED for communication)
# ================================================
TWILIO_ACCOUNT_SID=AC...your_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# ================================================
# PUSH NOTIFICATIONS (REQUIRED for background service)
# ================================================
FIREBASE_SERVER_KEY=AAAAyour_firebase_server_key
FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BM...your_vapid_key

# ================================================
# FILE STORAGE (for media)
# ================================================
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
AWS_S3_BUCKET=8rupiya-uploads

# ================================================
# GOOGLE ADSENSE (for revenue)
# ================================================
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-4472734290958984

# ================================================
# GOLU ADVANCED FEATURES
# ================================================
NEXT_PUBLIC_ENABLE_BACKGROUND_SERVICE=true
NEXT_PUBLIC_NOTIFICATION_INTERVAL=300000
NEXT_PUBLIC_ENABLE_VOICE=true
NEXT_PUBLIC_ENABLE_TOOLS=true
NEXT_PUBLIC_ENABLE_CANVAS=true
SESSION_TIMEOUT=3600000
MAX_SESSIONS_PER_USER=5

# ================================================
# FEATURE FLAGS
# ================================================
NEXT_PUBLIC_ENABLE_ECOMMERCE=true
NEXT_PUBLIC_ENABLE_COMMUNICATION=true
NEXT_PUBLIC_ENABLE_MEDIA_CONTROL=true
```

---

## 🔑 API Keys Kahan Se Milenge?

### **1. Google Gemini AI** 🤖
- **Website:** https://makersuite.google.com/app/apikey
- **Steps:**
  1. Google AI Studio pe jao
  2. "Get API Key" click karo
  3. Project select karo ya new banao
  4. API key copy karo
- **Required For:** GOLU main brain, AI responses

### **2. Google Cloud APIs** ☁️
- **Website:** https://console.cloud.google.com/
- **Steps:**
  1. New project banao
  2. Enable these APIs:
     - Google Maps API
     - Google Translate API
     - Google Places API
     - Custom Search API
  3. Credentials > API Keys > Create
  4. API key restrictions add karo
- **Required For:** Maps, Translation, Search, Places

### **3. Google Custom Search** 🔍
- **Website:** https://programmablesearchengine.google.com/
- **Steps:**
  1. New search engine banao
  2. "Search the entire web" enable karo
  3. Search engine ID copy karo
  4. Google Cloud Console se API key use karo
- **Required For:** Web search in GOLU

### **4. OpenWeather API** 🌤️
- **Website:** https://openweathermap.org/api
- **Steps:**
  1. Account banao (free tier)
  2. API keys section me jao
  3. API key copy karo
  4. Free tier: 1000 calls/day
- **Required For:** Weather information

### **5. Google Business Profile API** 🏢
- **Website:** https://console.cloud.google.com/
- **Steps:**
  1. Google Cloud Console me project banao
  2. "Google Business Profile API" enable karo
  3. OAuth 2.0 Client ID create karo (Web application)
  4. Redirect URI add karo: `http://localhost:3000/api/admin/google-business/oauth/callback`
  5. Client ID aur Client Secret copy karo
- **Required For:** Admin panel me Google Business account creation
- **See:** `GOOGLE_BUSINESS_SETUP.md` for detailed setup

### **6. Razorpay** 💳
- **Website:** https://dashboard.razorpay.com/
- **Steps:**
  1. Account banao
  2. Settings > API Keys
  3. Test mode keys copy karo
  4. Live mode activate karne ke liye KYC complete karo
- **Required For:** Payment processing

### **7. SendGrid** 📧
- **Website:** https://sendgrid.com/
- **Steps:**
  1. Free account banao (100 emails/day free)
  2. Settings > API Keys
  3. Create API key with full access
  4. Sender email verify karo
- **Required For:** Email notifications

### **7. Twilio** 📱
- **Website:** https://www.twilio.com/
- **Steps:**
  1. Account banao ($15 free credit)
  2. Console > Account Info
  3. Account SID aur Auth Token copy karo
  4. Phone Number buy karo (SMS/Voice)
  5. WhatsApp sandbox setup karo
- **Required For:** SMS, WhatsApp, Voice calls

### **8. Firebase (Push Notifications)** 🔔
- **Website:** https://console.firebase.google.com/
- **Steps:**
  1. New project banao
  2. Project settings > General > Web app add karo
  3. Config values copy karo
  4. Cloud Messaging > Web Push certificates
  5. Generate key pair (VAPID key)
  6. Server key copy karo
- **Required For:** Push notifications, background service

### **9. AWS S3 (File Storage)** ☁️
- **Website:** https://aws.amazon.com/s3/
- **Steps:**
  1. AWS account banao
  2. IAM > Users > Create new user
  3. S3 permissions attach karo
  4. Access Key aur Secret Key generate karo
  5. S3 bucket banao (ap-south-1 region)
- **Required For:** Image/file uploads

### **10. News API** 📰
- **Website:** https://newsapi.org/
- **Steps:**
  1. Free account banao
  2. API key copy karo
  3. Free tier: 100 requests/day
- **Required For:** News headlines

---

## 📊 API Usage & Limits

| API | Free Tier | Paid Plan | Usage |
|-----|-----------|-----------|-------|
| Google Gemini | 60 requests/min | Custom | GOLU Brain |
| Google Maps | $200 credit/month | Pay as you go | Location |
| Google Translate | 500K chars/month | $20/1M chars | Translation |
| OpenWeather | 1000 calls/day | $40/month | Weather |
| Razorpay | 0% (first ₹10L) | 2% + GST | Payments |
| SendGrid | 100 emails/day | $20/40K emails | Emails |
| Twilio | $15 credit | Pay per use | SMS/Voice |
| Firebase | 10GB storage | Pay as you go | Notifications |
| News API | 100 requests/day | $449/month | News |

---

## 🎯 Priority Setup (Minimum Required)

### **Must Have (for basic GOLU):**
1. ✅ MONGODB_URI - Database
2. ✅ JWT_SECRET - Authentication
3. ✅ GEMINI_API_KEY - AI brain

### **Important (for full features):**
4. ✅ GOOGLE_MAPS_API_KEY - Location
5. ✅ GOOGLE_TRANSLATE_API_KEY - Translation
6. ✅ OPENWEATHER_API_KEY - Weather
7. ✅ RAZORPAY keys - Payments

### **Optional (for advanced features):**
8. ⚠️ FIREBASE keys - Push notifications
9. ⚠️ TWILIO keys - SMS/WhatsApp
10. ⚠️ SENDGRID keys - Emails
11. ⚠️ AWS S3 keys - File uploads
12. ⚠️ NEWS_API_KEY - News

---

## 🔧 Quick Setup Commands

### **1. Clone & Install:**
```bash
cd /home/kvl/Desktop/8rupiya\ project/8rupiyadotcom
npm install
```

### **2. Create .env.local:**
```bash
cp .env.local.example .env.local
# Edit .env.local and add your keys
```

### **3. Test Database Connection:**
```bash
# Make sure MongoDB is running
npm run test:db
```

### **4. Start Development:**
```bash
npm run dev
```

---

## 🧪 Testing API Keys

### **Test Gemini AI:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY" \
-H 'Content-Type: application/json' \
-d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### **Test Google Maps:**
```bash
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Patna&key=YOUR_KEY"
```

### **Test OpenWeather:**
```bash
curl "http://api.openweathermap.org/data/2.5/weather?q=Patna&appid=YOUR_KEY"
```

---

## 🔒 Security Best Practices

1. **Never commit .env.local to git**
   ```bash
   # Already in .gitignore
   .env.local
   .env*.local
   ```

2. **Use environment variables for client-side:**
   - Prefix with `NEXT_PUBLIC_` for browser access
   - Never expose secret keys in client code

3. **Rotate keys regularly:**
   - Every 3-6 months
   - After any security incident

4. **Set API restrictions:**
   - Google APIs: Restrict by HTTP referrers
   - Add IP restrictions in production

5. **Use different keys for dev/prod:**
   - Test keys for development
   - Live keys only in production

---

## 📝 Environment Files Structure

```
/project-root
├── .env.local           # Your actual keys (git ignored)
├── .env.local.example   # Template without real keys
├── .env.development     # Dev-specific settings
├── .env.production      # Prod-specific settings
```

---

## 🚨 Troubleshooting

### **Problem: API key not working**
```bash
# Check if key is properly loaded
console.log(process.env.GEMINI_API_KEY); # Should show your key
```

### **Problem: CORS errors with Google APIs**
- Enable API in Google Cloud Console
- Check API restrictions
- Add your domain to allowed referrers

### **Problem: MongoDB connection failed**
- Check MongoDB is running
- Verify connection string
- Check network connectivity

---

## 📚 Additional Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Firebase Console](https://console.firebase.google.com/)
- [Razorpay Dashboard](https://dashboard.razorpay.com/)
- [Twilio Console](https://www.twilio.com/console)
- [SendGrid Dashboard](https://app.sendgrid.com/)

---

## ✅ Setup Checklist

- [ ] MongoDB URI configured
- [ ] JWT secrets set
- [ ] Gemini AI key added
- [ ] Google Maps API enabled
- [ ] Google Translate API enabled
- [ ] OpenWeather API key added
- [ ] Razorpay keys configured
- [ ] SendGrid/SMTP configured
- [ ] Twilio configured (optional)
- [ ] Firebase configured (optional)
- [ ] AWS S3 configured (optional)
- [ ] All NEXT_PUBLIC_ variables set
- [ ] Test all API connections
- [ ] Run development server
- [ ] Test GOLU features

---

**Status:** Ready for implementation ✅
**Last Updated:** Current Date


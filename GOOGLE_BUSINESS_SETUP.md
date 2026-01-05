# 🏢 Google Business Profile API Setup Guide

## Overview

यह system admin panel में shoppers के लिए Google Business Profile accounts create करने की सुविधा देता है।

---

## 🔑 Google Business API Setup

### Step 1: Google Cloud Console में Project बनाएं

1. Visit: https://console.cloud.google.com/
2. Login with Google account
3. "Select a project" → "New Project" click करें
4. Project name: `8Rupiya-GoogleBusiness` (या कोई भी नाम)
5. "Create" click करें

### Step 2: Google Business Profile API Enable करें

1. Left sidebar में "APIs & Services" → "Library" जाएं
2. Search करें: **"Google Business Profile API"** या **"My Business Account Management API"**
3. API को select करें और **"Enable"** click करें

**Note:** अगर API नहीं मिल रहा है, तो:
- "My Business Account Management API" search करें
- या "Google My Business API" search करें

### Step 3: OAuth 2.0 Credentials बनाएं

1. Left sidebar में "APIs & Services" → "Credentials" जाएं
2. Top पर "Create Credentials" → "OAuth client ID" select करें
3. अगर पहली बार है, तो "Configure consent screen" करें:
   - User Type: **External** (या Internal अगर Google Workspace use कर रहे हैं)
   - App name: `8Rupiya Business Manager`
   - User support email: अपना email
   - Developer contact: अपना email
   - "Save and Continue" click करें
   - Scopes: Add scopes:
     - `https://www.googleapis.com/auth/business.manage`
     - `https://www.googleapis.com/auth/plus.business.manage`
   - "Save and Continue" click करें
   - Test users add करें (अगर External है)
   - "Save and Continue" click करें

4. OAuth Client ID बनाएं:
   - Application type: **Web application**
   - Name: `8Rupiya Web Client`
   - Authorized redirect URIs: Add करें:
     ```
     http://localhost:3000/api/admin/google-business/oauth/callback
     https://yourdomain.com/api/admin/google-business/oauth/callback
     ```
   - "Create" click करें
   - **Client ID** और **Client Secret** copy करें

### Step 4: Environment Variables Add करें

`.env.local` file में add करें:

```env
# Google Business Profile API
GOOGLE_BUSINESS_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_BUSINESS_CLIENT_SECRET=your_client_secret_here

# NextAuth URL (OAuth callback के लिए)
NEXTAUTH_URL=http://localhost:3000
# Production में:
# NEXTAUTH_URL=https://yourdomain.com
```

---

## 🚀 Features

### 1. **Account Creation**
- Admin panel से shopper के shop के लिए Google Business account create करें
- Shop details automatically fill होते हैं
- OAuth flow के through Google account connect करें

### 2. **OAuth Flow**
- Admin "Create Account" click करता है
- Google OAuth page open होता है
- User Google account से login करता है
- Permissions grant करता है
- Account automatically connect हो जाता है

### 3. **Account Management**
- सभी accounts की list view करें
- Status filter करें (Pending, Connected, Verified, Suspended, Failed)
- Verification status check करें
- Google rating और reviews देखें

### 4. **Sync Functionality**
- Manual sync: "Sync Now" button से data sync करें
- Auto sync: (Future feature) Automatic sync enable करें
- Sync करने पर:
  - Google rating update होता है
  - Review count update होता है
  - Photos sync होते हैं
  - Verification status check होता है

### 5. **Error Handling**
- Token expiry automatically handle होता है
- Refresh token use करके new access token fetch होता है
- Errors track होते हैं
- Failed accounts को identify करना आसान है

---

## 📋 Admin Panel Usage

### Create Account:

1. Admin panel में "Google Business" section जाएं
2. "Create Account" button click करें
3. Form fill करें:
   - Shop select करें (dropdown से)
   - Business name enter करें
   - Address enter करें
   - Phone number enter करें
   - Website (optional)
   - Category (optional)
   - Description (optional)
   - Latitude/Longitude (optional, auto-fill हो सकता है)
4. "Create Account" click करें
5. Google OAuth page open होगा
6. Google account से login करें
7. Permissions grant करें
8. Redirect back होने पर account connected हो जाएगा

### View Accounts:

- सभी accounts की table में list दिखती है
- Search करें (shop name, shopper name, email)
- Filter करें (status, verification status)
- Stats cards में overview देखें

### Sync Account:

1. Account row में "Sync" button click करें
2. System automatically:
   - Token refresh करता है (अगर expired है)
   - Google Business Profile data fetch करता है
   - Rating, reviews, photos update करता है
   - Verification status check करता है

### Delete Account:

1. Account row में "Delete" button click करें
2. Confirm करें
3. Account delete हो जाएगा

---

## 🔧 API Endpoints

### GET `/api/admin/google-business`
- सभी accounts fetch करें
- Query params: `search`, `status`, `verificationStatus`

### POST `/api/admin/google-business`
- नया account create करें
- Body: shop details
- Returns: `oauthUrl` for OAuth flow

### GET `/api/admin/google-business/stats`
- Statistics fetch करें
- Returns: total, connected, verified, pending, failed counts

### POST `/api/admin/google-business/[id]/sync`
- Account sync करें
- Google data fetch करके update करता है

### DELETE `/api/admin/google-business/[id]`
- Account delete करें

### GET `/api/admin/google-business/oauth/callback`
- OAuth callback handle करता है
- Token exchange करता है
- Account connect करता है

---

## ⚠️ Important Notes

1. **API Access**: Google Business Profile API access के लिए Google से approval चाहिए हो सकता है
2. **Quotas**: API quotas check करें - daily limits हो सकते हैं
3. **Verification**: Business verification Google के through होता है (phone, email, या postcard)
4. **Token Security**: Production में tokens को encrypt करके store करें
5. **Error Handling**: Failed accounts को monitor करें और manually fix करें

---

## 🐛 Troubleshooting

### OAuth Error:
- Check करें कि redirect URI correct है
- Client ID और Secret correct हैं
- Consent screen properly configured है

### Token Refresh Failed:
- Refresh token invalid हो सकता है
- User ने permissions revoke किए हो सकते हैं
- Account को reconnect करना पड़ सकता है

### Location Not Found:
- Location ID missing है
- OAuth flow complete नहीं हुआ
- Account को reconnect करें

### Sync Failed:
- API quota exceeded हो सकता है
- Token expired हो सकता है
- Network issue हो सकता है
- Error message check करें

---

## 📚 Documentation Links

- Google Business Profile API: https://developers.google.com/my-business
- OAuth 2.0 Setup: https://developers.google.com/identity/protocols/oauth2
- API Reference: https://developers.google.com/my-business/content/overview

---

## ✅ Checklist

- [ ] Google Cloud Project created
- [ ] Google Business Profile API enabled
- [ ] OAuth 2.0 credentials created
- [ ] Consent screen configured
- [ ] Redirect URIs added
- [ ] Environment variables set
- [ ] Server restarted
- [ ] Test account created
- [ ] OAuth flow tested
- [ ] Sync functionality tested

---

System ready है! Admin panel में "Google Business" section use करें।


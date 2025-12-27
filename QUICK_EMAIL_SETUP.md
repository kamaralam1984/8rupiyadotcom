# Quick Email Setup - 5 Minutes

## Problem: Email नहीं जा रहा?

अगर आपको message दिख रहा है:
- "Development Mode - Your OTP: 123456"
- "Email NOT sent - SMTP not configured"

तो SMTP setup करना होगा।

## Solution: Gmail Setup (सबसे आसान)

### Step 1: Gmail App Password बनाएं (2 minutes)

1. **Google Account खोलें:**
   - https://myaccount.google.com/
   - या Google.com पर login करें

2. **2-Step Verification Enable करें:**
   - Security tab पर जाएं
   - "2-Step Verification" enable करें (अगर नहीं है)

3. **App Password Generate करें:**
   - Direct link: https://myaccount.google.com/apppasswords
   - या Security → App passwords
   - Select app: **"Mail"**
   - Select device: **"Other (Custom name)"**
   - Name: **"8rupiya OTP"** लिखें
   - **Generate** button click करें

4. **16-character Password Copy करें:**
   - जैसे: `abcd efgh ijkl mnop`
   - **Important:** Spaces हटा दें: `abcdefghijklmnop`

### Step 2: .env.local में Add करें (1 minute)

1. Project folder में `.env.local` file खोलें
2. नीचे ये 2 lines add करें:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
```

**Example:**
```env
SMTP_USER=kamaralam137@gmail.com
SMTP_PASS=abcdefghijklmnop
```

**Important:**
- `SMTP_USER` में अपना Gmail email address लिखें
- `SMTP_PASS` में App Password लिखें (spaces नहीं)
- कोई quotes नहीं, कोई spaces नहीं

### Step 3: Server Restart करें (30 seconds)

1. Terminal में जहाँ `npm run dev` चल रहा है
2. **Ctrl+C** दबाकर server stop करें
3. फिर restart करें:
   ```bash
   npm run dev
   ```

### Step 4: Test करें (1 minute)

1. Browser में `/register` page पर जाएं
2. Form fill करें और "Send OTP" click करें
3. **Server console check करें:**
   - अगर `✅ Email sent successfully!` दिखे = Email भेजा गया ✅
   - अगर `⚠️ EMAIL NOT SENT` दिखे = Setup गलत है ❌
4. **Email inbox check करें:**
   - Inbox में OTP email आना चाहिए
   - Spam folder भी check करें

## Troubleshooting

### अगर अभी भी email नहीं जा रहा:

1. **Server console में error check करें:**
   - Terminal में error message देखें
   - अगर "Authentication failed" = App Password गलत है
   - अगर "Connection timeout" = Internet/Firewall issue

2. **.env.local file verify करें:**
   ```bash
   # Terminal में run करें:
   cat .env.local | grep SMTP
   ```
   - `SMTP_USER` और `SMTP_PASS` दिखना चाहिए

3. **Server restart किया?**
   - `.env.local` change के बाद server restart जरूरी है

4. **App Password सही है?**
   - Gmail App Password 16 characters का होना चाहिए
   - Spaces नहीं होने चाहिए
   - Regular password नहीं, App Password होना चाहिए

## Success Indicators

✅ **Email भेजा गया अगर:**
- Server console में: `✅ Email sent successfully!`
- Browser में: `✅ OTP sent successfully! Please check your email inbox`
- Email inbox में OTP email मिले

❌ **Email नहीं भेजा गया अगर:**
- Server console में: `⚠️ EMAIL NOT SENT - SMTP NOT CONFIGURED!`
- Browser में: `⚠️ OTP Generated (Email NOT sent - SMTP not configured)`
- OTP सिर्फ console में दिखे

## Need Help?

अगर अभी भी problem है:
1. Server console का screenshot भेजें
2. `.env.local` file का content (SMTP lines) share करें (password hide करके)
3. Error message share करें


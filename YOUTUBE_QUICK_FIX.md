# 🎵 YouTube "Video Unavailable" - Quick Fix

## Problem
```
User: "kesariya song sunao"
Golu: [Shows YouTube player]
Player: ⚠️ "This video is unavailable"
```

---

## ✅ Solution (5 Minutes Setup)

### Step 1: Get YouTube API Key

1. **Visit:** https://console.cloud.google.com/
2. **Login** with Google account
3. **Create Project** (or select existing)
4. **Enable API:**
   - Go to: "APIs & Services" > "Library"
   - Search: "YouTube Data API v3"
   - Click "Enable"
5. **Create API Key:**
   - Go to: "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - **Copy the key** (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

### Step 2: Add to .env File

Open your `.env` file and add:

```bash
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**OR** (if you want to use same key for multiple Google services):

```bash
GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 3: Restart Server

```bash
npm run dev
```

---

## 🧪 Test It

Try these commands in Golu:

```
1. "kesariya song sunao"
2. "pushpa 2 trailer dikhao"
3. "kgf chapter 2 climax"
```

**Expected Result:**
- ✅ Video title dikhe
- ✅ Channel name dikhe
- ✅ Video player me actual video play ho
- ✅ No "unavailable" error

---

## 📊 Free Tier Limits

- **10,000 API calls per day** (free)
- Each video search = 100 units
- **~100 video searches per day**
- Perfect for small to medium usage

---

## 🔧 Still Not Working?

### Check 1: API Key Correct Hai?
```bash
cat .env | grep YOUTUBE
# Should show: YOUTUBE_API_KEY=AIza...
```

### Check 2: Server Restart Kiya?
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Check 3: API Enabled Hai?
- Go to: https://console.cloud.google.com/apis/library
- Search: "YouTube Data API v3"
- Should show: "API Enabled" ✅

---

## 💡 Without API Key?

Code already has **fallback support**:
- Shows YouTube search URL instead
- User can click and watch on YouTube
- Not as smooth, but works!

---

## 📝 Summary

| Status | What Happens |
|--------|-------------|
| ❌ **No API Key** | Shows search URL (fallback) |
| ✅ **With API Key** | Direct video plays in chat |

**Recommendation:** Add API key for best experience! 🚀

---

## 🎉 After Setup

Your users can enjoy:
- 🎵 Songs directly in chat
- 🎬 Movie trailers embedded
- 📺 Any YouTube video on demand
- ⚡ Fast, smooth playback
- 🎯 Accurate search results

---

**Need Help?** Check `YOUTUBE_API_SETUP.md` for detailed guide.


# 🎵 YouTube API Setup Guide for Golu

## Problem
Video "unavailable" dikha raha tha kyunki YouTube embed search URL properly work nahi karta. Ab **YouTube Data API v3** use karke actual video ID fetch kar rahe hain.

---

## ✅ Solution Implemented

### 1. **YouTube Search Function Added** (`src/lib/google-apis.ts`)
```typescript
export async function searchYouTubeVideo(query: string): Promise<{ videoId: string; title: string; channelTitle: string; thumbnail: string } | null>
```

**Features:**
- Real video ID fetch karta hai
- Video title, channel, thumbnail return karta hai
- Proper embed URL generate karta hai with autoplay

### 2. **Updated processMedia** (`src/app/api/golu/chat/route.ts`)
- YouTube Data API se video search
- Actual video ID se embed URL banata hai
- Fallback to search URL if API key missing

---

## 🔑 YouTube API Key Setup (Required)

### Step 1: Google Cloud Console me jao
1. Visit: https://console.cloud.google.com/
2. Login with your Google account

### Step 2: New Project banao (ya existing use karo)
1. Top bar me project selector click karo
2. "New Project" click karo
3. Project name: `8Rupiya-Golu` (ya koi bhi naam)
4. Click "Create"

### Step 3: YouTube Data API v3 Enable karo
1. Left sidebar me "APIs & Services" > "Library" jao
2. Search karo: **"YouTube Data API v3"**
3. Click karo aur **"Enable"** button press karo

### Step 4: API Key Generate karo
1. Left sidebar me "APIs & Services" > "Credentials" jao
2. Top me "Create Credentials" click karo
3. Select: **"API Key"**
4. API key copy kar lo (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

### Step 5: API Key ko Secure karo (Optional but Recommended)
1. Generated API key ke paas "Edit" icon click karo
2. "API restrictions" section me:
   - Select: **"Restrict key"**
   - Check: **"YouTube Data API v3"**
3. "Application restrictions" me:
   - Select: **"HTTP referrers"** (for web)
   - Add: `localhost:3000/*`, `yourdomain.com/*`
4. Save karo

### Step 6: .env File me Add karo
```bash
# YouTube API Key
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# OR use GOOGLE_API_KEY (same key works for multiple Google APIs)
GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 7: Server Restart karo
```bash
npm run dev
# or
yarn dev
```

---

## 🎯 How It Works Now

### **Before (Without API Key):**
```
User: "kesariya song sunao"
Golu: 🔍 "kesariya" ke liye search results:
      https://www.youtube.com/results?search_query=kesariya
      (YouTube API configure karne ke baad direct video play hoga)
```

### **After (With API Key):**
```
User: "kesariya song sunao"
Golu: 🎵 "Kesariya - Brahmastra | Ranbir Kapoor | Arijit Singh" play kar raha hoon...
      📺 Zee Music Company
      Neeche video player me dekh sakte hain!
      
      [Embedded YouTube Player with actual video playing]
```

---

## 📊 API Quota Information

**YouTube Data API v3 Free Tier:**
- **10,000 units per day** (free)
- Each search = **100 units**
- **~100 video searches per day** possible

**Quota Calculation:**
- Search query = 100 units
- If you have 50 users searching 2 videos each = 10,000 units
- **Enough for small to medium usage**

**If quota exceeds:**
- Fallback to search URL (already implemented)
- Users will see search results instead of direct video

---

## 🧪 Testing

### Test Commands:
```
1. "kesariya song sunao"
2. "pushpa 2 trailer dikhao"
3. "kgf chapter 2 climax scene"
4. "arijit singh songs"
5. "youtube on kro" (will ask for specific video)
```

### Expected Response:
- ✅ Video title dikhe
- ✅ Channel name dikhe
- ✅ Embedded player me video play ho
- ✅ Autoplay enabled
- ✅ Full screen option available

---

## 🔧 Troubleshooting

### Problem 1: "This video is unavailable"
**Solution:** API key missing hai. `.env` file check karo.

### Problem 2: "YouTube API error: 403"
**Solution:** 
- API key restrictions check karo
- YouTube Data API v3 enabled hai ya nahi check karo
- Quota limit exceed ho gaya ho sakta hai

### Problem 3: "YouTube API key not configured"
**Solution:** 
- `.env` file me `YOUTUBE_API_KEY` ya `GOOGLE_API_KEY` add karo
- Server restart karo

### Problem 4: Search results dikha rahe hain, video nahi
**Solution:** 
- API key properly configured nahi hai
- Console logs check karo: `console.warn('YouTube API key not configured')`

---

## 🚀 Advanced Features (Future)

### Possible Enhancements:
1. **Playlist Support:** "Arijit Singh playlist sunao"
2. **Video Quality Selection:** "HD me dikhao"
3. **Lyrics Display:** Sync lyrics with video
4. **Queue Management:** Multiple songs queue me add karo
5. **History:** Recently played videos
6. **Favorites:** Favorite songs save karo

---

## 📝 Files Modified

1. **`src/lib/google-apis.ts`**
   - Added `searchYouTubeVideo()` function
   - Returns video ID, title, channel, thumbnail

2. **`src/app/api/golu/chat/route.ts`**
   - Updated `processMedia()` function
   - Integrated YouTube Data API
   - Added fallback for missing API key

3. **`src/components/AIAssistant.tsx`**
   - Already has embedded player support
   - No changes needed

---

## 💡 Quick Setup (Copy-Paste)

```bash
# 1. Get API key from: https://console.cloud.google.com/
# 2. Add to .env file:
echo "YOUTUBE_API_KEY=YOUR_API_KEY_HERE" >> .env

# 3. Restart server
npm run dev
```

---

## ✅ Verification Checklist

- [ ] Google Cloud Console account created
- [ ] YouTube Data API v3 enabled
- [ ] API key generated
- [ ] API key added to `.env` file
- [ ] Server restarted
- [ ] Test query: "kesariya song sunao"
- [ ] Video plays in embedded player
- [ ] No "unavailable" error

---

**Status:** ✅ Implementation Complete  
**Next Step:** Add YouTube API key to `.env` file  
**Expected Result:** Videos will play directly in chat without "unavailable" error

---

## 🎉 Benefits After Setup

✅ **Real videos play** - No more "unavailable" error  
✅ **Accurate results** - YouTube's own search algorithm  
✅ **Video metadata** - Title, channel, thumbnail  
✅ **Autoplay enabled** - Video starts automatically  
✅ **Better UX** - Professional video player experience  
✅ **Fallback support** - Works even without API key (shows search URL)


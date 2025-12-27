# Google AdSense Ads Placement Guide

## 📍 Ad Spaces Created

### 1. **Homepage** (`HomepageClient.tsx`)
- ✅ Between Featured Shops and Paid Shops
- ✅ After Paid Shops section
- ✅ Between Top Rated and All Shops sections
- ✅ In TopRated component (after shops list)
- ✅ Total: **4 ad spaces**

### 2. **Shop Detail Page** (`ShopPopup.tsx`)
- ✅ Inside shop popup modal (between description and contact info)
- ✅ Slot type: `shop`
- ✅ Total: **1 ad space**

### 3. **Left Sidebar** (`LeftRail.tsx`)
- ✅ Ad Space 1: Category ads
- ✅ Ad Space 2: Category ads
- ✅ Ad Space 3: Homepage ads
- ✅ Total: **3 ad spaces**

### 4. **Right Sidebar** (`RightRail.tsx`)
- ✅ Ad Space 1: Homepage ads (after Top Rated)
- ✅ Ad Space 2: Homepage ads (after Trending)
- ✅ Total: **2 ad spaces**

### 5. **Search/Category Results** (`Nearby.tsx`)
- ✅ After shops list in search results
- ✅ Slot type: `search`
- ✅ Total: **1 ad space**

## 📊 Total Ad Spaces: **11 Locations**

## 🎯 Ad Slot Types:

1. **`homepage`** - Homepage ads (7 locations)
2. **`category`** - Category page ads (2 locations)
3. **`search`** - Search results ads (1 location)
4. **`shop`** - Shop detail page ads (1 location)

## ⚙️ How to Configure:

### Step 1: Admin Panel में जाएं
1. Login: `http://localhost:3000/admin`
2. Go to: **Ads** section
3. Paste your Google AdSense code

### Step 2: Enable Ad Slots
Toggle ON करें:
- ✅ Homepage Ads
- ✅ Category Ads
- ✅ Search Ads
- ✅ Shop Page Ads

### Step 3: AdSense Code Format
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

## 📱 Ad Display Logic:

- Ads automatically show/hide based on admin settings
- If AdSense code is not configured, ads won't display
- Each slot type can be enabled/disabled independently
- Ads are responsive and mobile-friendly

## 🎨 Ad Styling:

- Background: Gray-50 (light mode) / Gray-800 (dark mode)
- Border: Gray-200 / Gray-700
- Padding: 16px
- Minimum height: 100px
- Responsive: Auto-adjusts to screen size

## ✅ Benefits:

1. **Multiple Revenue Streams** - 11 ad locations
2. **Strategic Placement** - High visibility areas
3. **User-Friendly** - Non-intrusive design
4. **Admin Control** - Enable/disable per slot type
5. **Mobile Optimized** - Responsive design

## 🔍 Testing:

1. Enable ads in admin panel
2. Visit homepage - check for ads
3. Click on a shop - check shop detail ad
4. Search for shops - check search results ad
5. Check sidebar ads (left and right)

## 📝 Notes:

- Ads only show when:
  - AdSense code is configured
  - Slot type is enabled in admin panel
  - User is not in admin/agent panel
- Ads are lazy-loaded for better performance
- Each ad slot is independent


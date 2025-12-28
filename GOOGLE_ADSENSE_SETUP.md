# Google AdSense Setup Guide

## ✅ Implementation Complete

Google AdSense has been integrated into your website. Ads will now display automatically on all pages where AdSlot components are placed.

## 📋 Setup Steps

### Step 1: Add Environment Variable

Create or update your `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-4472734290958984
```

**Your AdSense Client ID**: `ca-pub-4472734290958984`

### Step 2: Restart Development Server

After adding the environment variable, restart your Next.js server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Build for Production

For production deployment:

```bash
npm run build
npm start
```

Make sure to add the environment variable to your hosting platform (Vercel, Netlify, etc.)

## 📍 Where Ads Will Appear

Ads are automatically displayed in these locations:

### Homepage (`HomepageClient.tsx`)
1. ✅ Between Featured Shops and Paid Shops
2. ✅ After Paid Shops section
3. ✅ Between Top Rated and All Shops sections
4. ✅ In TopRated component (after shops list)

### Left Sidebar (`LeftRail.tsx`)
5. ✅ Category page ads (multiple locations)

### Right Sidebar (`RightRail.tsx`)
6. ✅ Homepage ads (after Top Rated)
7. ✅ Homepage ads (after Trending)

### Search Results (`Nearby.tsx`)
8. ✅ After shops list in search results

### Shop Detail Page (`ShopPopup.tsx`)
9. ✅ Inside shop popup modal

**Total: 9+ ad locations across the website**

## 🔧 How It Works

1. **Script Loading**: AdSense script loads automatically in `<head>` via `layout.tsx`
2. **Ad Components**: `AdSlot` and `GoogleAdSense` components handle ad display
3. **Auto-Initialization**: Ads initialize automatically when page loads
4. **Responsive**: All ads are responsive and adapt to screen size

## 🎨 Ad Display Settings

Ads are configured with:
- **Format**: Auto (automatically selects best ad size)
- **Responsive**: Yes (adapts to screen size)
- **Min Size**: 320x100px (for mobile compatibility)

## ⚙️ Admin Panel Configuration

You can also configure ads via the Admin Panel:

1. Go to: `/admin/ads`
2. Enable/disable ad slots
3. Add custom ad codes
4. Configure AdSense settings

## 📊 AdSense Requirements

Make sure your website:
- ✅ Has original, quality content
- ✅ Follows Google AdSense policies
- ✅ Has proper privacy policy and terms of service
- ✅ Is fully functional (not under construction)
- ✅ Has sufficient traffic (varies by region)

## 🔍 Verification

To verify ads are working:

1. **Check Browser Console**: No AdSense errors should appear
2. **Check Network Tab**: AdSense script should load from `googlesyndication.com`
3. **Check Elements**: Look for `<ins class="adsbygoogle">` elements
4. **Test on Production**: AdSense shows ads only on approved domains

## ⚠️ Important Notes

- **Development Mode**: AdSense may show blank/placeholder ads in development
- **Approval Required**: Your site must be approved by Google AdSense first
- **Domain Verification**: Only approved domains will show real ads
- **Policy Compliance**: Make sure your site follows Google's policies

## 🐛 Troubleshooting

### Ads Not Showing?

1. **Check Environment Variable**: Ensure `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` is set
2. **Check AdSense Approval**: Make sure your site is approved
3. **Check Console**: Look for JavaScript errors
4. **Check Network**: Ensure AdSense script loads successfully
5. **Wait 24-48 hours**: Sometimes ads take time to appear after approval

### Script Not Loading?

1. Check if script exists in page source
2. Check browser console for CORS or loading errors
3. Verify environment variable is accessible (client-side variable must start with `NEXT_PUBLIC_`)

### Ads Showing as Blank?

1. Normal in development mode - ads only show on approved production domains
2. Check AdSense account for any policy violations
3. Ensure sufficient content on pages

## 📱 Testing

### Local Testing:
- Ads may not show (Google serves ads only to approved domains)
- Check console for initialization messages
- Verify script loads correctly

### Production Testing:
- Deploy to your domain
- Verify domain in AdSense
- Wait for approval
- Ads should appear within 24-48 hours

## 📞 Support

- **Google AdSense Help**: https://support.google.com/adsense
- **AdSense Policies**: https://support.google.com/adsense/answer/48182
- **AdSense Forum**: https://support.google.com/adsense/community

## 🔗 Files Modified

- ✅ `src/app/layout.tsx` - Added AdSense script
- ✅ `src/components/GoogleAdSense.tsx` - AdSense component
- ✅ `src/components/AdSlot.tsx` - Ad slot wrapper
- ✅ Multiple pages - Ad slots added

## ✅ Your AdSense ID

**Client ID**: `ca-pub-4472734290958984`

Add this to `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-4472734290958984
```


# Google AdSense Setup Guide - Step by Step

## 📋 Complete Setup Process

### Step 1: Google AdSense Account बनाएं

1. **Google AdSense Website पर जाएं:**
   - https://www.google.com/adsense पर visit करें
   - "Get Started" button click करें

2. **Account Create करें:**
   - अपना website URL enter करें: `http://localhost:3000` (development के लिए)
   - Production में: `https://8rupiya.com`
   - Country select करें
   - Payment method add करें

3. **Website Verification:**
   - Google verification code देंगे
   - Website में code add करना होगा (Next.js में `layout.tsx` में)

### Step 2: AdSense Code लें

1. **AdSense Dashboard में जाएं:**
   - https://www.google.com/adsense पर login करें
   - "Ads" → "By ad unit" पर click करें

2. **New Ad Unit Create करें:**
   - "Create ad unit" button click करें
   - Ad format select करें (Display ads, In-feed ads, etc.)
   - Ad size select करें (Responsive recommended)
   - Name दें (जैसे: "Homepage Sidebar Ad")

3. **Code Copy करें:**
   - Google आपको code देगा, जैसे:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
        crossorigin="anonymous"></script>
   <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-1234567890123456"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
   <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
   </script>
   ```

### Step 3: Admin Panel में Code Add करें

1. **Admin Panel खोलें:**
   - `http://localhost:3000/admin/ads` पर जाएं
   - Login करें (admin credentials से)

2. **Ad Slots Enable करें:**
   - जहाँ ads चाहिए, वहाँ toggle ON करें:
     - ✅ Homepage Ads (Homepage पर ads)
     - ✅ Category Ads (Category pages पर)
     - ✅ Search Ads (Search results में)
     - ✅ Shop Page Ads (Shop pages पर)

3. **AdSense Code Paste करें:**
   - Textarea में Google से मिला code paste करें
   - पूरा code paste करें (script tags सहित)

4. **Save करें:**
   - "Save Settings" button click करें
   - Success message दिखेगा

### Step 4: Website पर Verify करें

1. **Homepage Check करें:**
   - `http://localhost:3000` पर जाएं
   - Right sidebar में ads दिखने चाहिए
   - Main content में भी ads दिख सकते हैं

2. **Browser Console Check करें:**
   - F12 दबाकर Developer Tools खोलें
   - Console tab में errors check करें
   - Network tab में AdSense requests check करें

## 🔧 Code Format Examples

### Example 1: Simple AdSense Code
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXX"
     data-ad-slot="1234567890"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

### Example 2: Multiple Ad Units
अगर multiple ads चाहिए, तो हर ad unit का code अलग paste करें:
```html
<!-- Ad Unit 1 -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"></script>
<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXXXX" data-ad-slot="1111111111"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>

<!-- Ad Unit 2 -->
<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXXXX" data-ad-slot="2222222222"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

## ⚠️ Important Notes

### Development vs Production

**Development (localhost):**
- AdSense ads localhost पर नहीं दिखेंगे
- Code add कर सकते हैं, लेकिन ads serve नहीं होंगे
- Production deploy के बाद ads दिखेंगे

**Production:**
- Website live होने के बाद ads दिखेंगे
- Google approval के बाद ads serve होंगे
- Usually 24-48 hours लगते हैं

### AdSense Approval Process

1. **Website Submit करें**
2. **Google Review करेगा** (1-2 weeks)
3. **Approval मिलने पर ads start होंगे**

### Best Practices

1. **Content Quality:**
   - Original, high-quality content होना चाहिए
   - Copyright violations नहीं होनी चाहिए

2. **Traffic:**
   - Minimum traffic requirement हो सकता है
   - Regular visitors होने चाहिए

3. **Ad Placement:**
   - Ads content के साथ naturally integrate होने चाहिए
   - Too many ads avoid करें

## 🐛 Troubleshooting

### Ads नहीं दिख रहे?

1. **Check करें:**
   - Ad slots enabled हैं?
   - AdSense code properly paste किया?
   - Settings save हुई?

2. **Browser Console:**
   - F12 → Console tab
   - Errors check करें
   - AdSense script load हो रहा है?

3. **Network Tab:**
   - F12 → Network tab
   - `adsbygoogle` requests check करें
   - Status codes check करें

### Common Errors

**"AdSense code not found":**
- Code properly paste नहीं हुआ
- Script tags missing हैं

**"Invalid client ID":**
- `ca-pub-XXXXXXXXXX` format check करें
- Correct AdSense account से code लिया है?

**"Ad blocked":**
- Ad blocker extension disable करें
- Browser settings check करें

## 📞 Support

अगर problem है:
1. Browser console में errors check करें
2. AdSense dashboard में status check करें
3. Google AdSense support से contact करें

## ✅ Quick Checklist

- [ ] Google AdSense account created
- [ ] Website verified
- [ ] Ad unit created
- [ ] Code copied
- [ ] Admin panel में code pasted
- [ ] Ad slots enabled
- [ ] Settings saved
- [ ] Website पर ads check किए

---

**Note:** Development में ads नहीं दिखेंगे। Production deploy के बाद ही ads serve होंगे।


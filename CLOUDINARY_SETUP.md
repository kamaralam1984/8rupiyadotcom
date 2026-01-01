# Cloudinary Image Upload Setup ☁️

## 🎯 Purpose

**Solves the "Failed to save file" error** by using cloud storage instead of local file system!

### **Benefits:**
- ✅ No permission issues
- ✅ Automatic CDN delivery (fast worldwide)
- ✅ Auto image optimization
- ✅ Unlimited storage
- ✅ Works on any hosting platform
- ✅ Mobile-friendly uploads

---

## 📋 Setup Steps

### **1. Create Cloudinary Account**

1. Go to: https://cloudinary.com/
2. Click **"Sign Up for Free"**
3. Fill details:
   - Email
   - Password
   - Choose role: **Developer**
4. Verify email
5. Login to dashboard

### **2. Get API Credentials**

After login, you'll see your dashboard:

```
Cloud Name: your-cloud-name
API Key: 123456789012345
API Secret: AbCdEfGhIjKlMnOpQrStUvWxYz
```

**Or find them:**
1. Go to: https://console.cloudinary.com/
2. Click **"Dashboard"** (top left)
3. Scroll down to **"Account Details"**
4. You'll see:
   - Cloud Name
   - API Key
   - API Secret (click eye icon to reveal)

### **3. Add to .env.local**

Open your `.env.local` file and add:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**Example:**
```bash
CLOUDINARY_CLOUD_NAME=8rupiya
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
```

### **4. Restart Server**

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 🧪 Testing

### **1. Upload Test**
1. Go to: http://localhost:3000/shopper/shops/new
2. Complete Steps 1-2
3. In Step 3, click **"Capture Photo"** or **"Upload from Device"**
4. Select an image
5. Watch console logs

### **2. Check Logs**

**Server Terminal:**
```bash
☁️  Using Cloudinary for upload...
✅ Cloudinary upload successful: https://res.cloudinary.com/...
✅ Storage type: Cloudinary
```

**Browser Console:**
```javascript
✅ Image uploaded successfully: https://res.cloudinary.com/...
```

### **3. Verify on Cloudinary**
1. Go to: https://console.cloudinary.com/console/media_library
2. Click **"Media Library"**
3. Open folder **"8rupiya-shops"**
4. Your uploaded images should be there!

---

## 📁 Folder Structure

All shop images are stored in:
```
Cloudinary > Media Library > 8rupiya-shops/
```

You can organize further:
- `8rupiya-shops/electronics/`
- `8rupiya-shops/clothing/`
- etc.

---

## 🔄 Automatic Features

### **Image Optimization:**
- **Auto-resize**: Max 1200x1200px
- **Auto-format**: WebP for modern browsers
- **Auto-quality**: Optimized for fast loading
- **Responsive**: Different sizes for mobile/desktop

### **Transformations:**
All images automatically get:
```javascript
{ 
  width: 1200, 
  height: 1200, 
  crop: 'limit', 
  quality: 'auto:good' 
}
```

---

## 💾 Fallback to Local Storage

**If Cloudinary is NOT configured:**
- System automatically uses local file storage
- Images saved to: `public/uploads/`
- Console shows: `💾 Using local storage`

**If Cloudinary IS configured:**
- System uses Cloudinary
- Console shows: `☁️  Using Cloudinary for upload...`

---

## 🌍 Image URLs

### **Cloudinary URL Format:**
```
https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{filename}
```

**Example:**
```
https://res.cloudinary.com/8rupiya/image/upload/v1234567890/8rupiya-shops/shop_abc123.jpg
```

### **Local URL Format:**
```
http://localhost:3000/uploads/1234567890-abc123.jpg
```

---

## 🔒 Security

### **Environment Variables:**
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Never commit API credentials
- ✅ Use different accounts for dev/production

### **Upload Settings:**
- ✅ Signed uploads (secure)
- ✅ File type validation
- ✅ File size limits (10MB)
- ✅ Token authentication required

---

## 📊 Cloudinary Free Plan

**What You Get:**
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25 credits/month
- **Images**: Unlimited uploads
- **Users**: 1 user

**Should be enough for:**
- 5,000+ shop images
- 10,000+ page views/month

**When to upgrade:**
- More than 5,000 shops
- More than 100,000 views/month
- Need video uploads

---

## 🛠️ Advanced Configuration

### **Custom Folder:**
Change folder name in `src/lib/cloudinary.ts`:
```typescript
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'my-custom-folder' // Change this
)
```

### **Custom Transformations:**
Add more transformations:
```typescript
transformation: [
  { width: 1200, height: 1200, crop: 'limit' },
  { quality: 'auto:good' },
  { fetch_format: 'auto' }, // Auto WebP
  { effect: 'sharpen:50' }, // Sharpen
],
```

### **Upload Presets:**
Create preset in Cloudinary dashboard:
1. Go to Settings > Upload
2. Add upload preset
3. Use in code:
```typescript
upload_preset: 'my_preset'
```

---

## 🐛 Troubleshooting

### **Error: "Invalid API Key"**
```bash
Solution: Check CLOUDINARY_API_KEY in .env.local
- Make sure there are no spaces
- Make sure it's the correct key from dashboard
```

### **Error: "Invalid signature"**
```bash
Solution: Check CLOUDINARY_API_SECRET
- Make sure it matches dashboard
- Restart server after changing
```

### **Error: "Cloud name not found"**
```bash
Solution: Check CLOUDINARY_CLOUD_NAME
- It should be just the name, not URL
- Example: "8rupiya" not "https://8rupiya.cloudinary.com"
```

### **Still Using Local Storage**
```bash
Check:
1. Are all 3 env variables set?
2. Did you restart server?
3. Check server logs for "☁️  Using Cloudinary"
```

---

## 📝 Migration from Local to Cloudinary

### **Step 1: Backup Current Images**
```bash
cd public/uploads
cp -r . ~/backup-images/
```

### **Step 2: Setup Cloudinary**
(Follow setup steps above)

### **Step 3: Upload Existing Images**
Use Cloudinary CLI or dashboard:
```bash
# Install Cloudinary CLI
npm install -g cloudinary-cli

# Upload folder
cld uploader upload_dir ./public/uploads \
  --folder 8rupiya-shops \
  --use_filename
```

### **Step 4: Update Database URLs**
Run migration script to update image URLs in database from:
```
/uploads/image.jpg
```
to:
```
https://res.cloudinary.com/8rupiya/image/upload/v.../8rupiya-shops/image.jpg
```

---

## 🎯 Production Deployment

### **Vercel/Netlify:**
1. Go to project settings
2. Add environment variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Redeploy

### **Custom Server:**
Add to `.env` file on server:
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 📞 Support

### **Cloudinary Support:**
- Docs: https://cloudinary.com/documentation
- Support: https://support.cloudinary.com/
- Community: https://community.cloudinary.com/

### **Common Questions:**

**Q: Is it free forever?**
A: Yes, free plan is permanent! Upgrade only if you need more.

**Q: What happens if I exceed limits?**
A: You'll get email notification. Upgrade or wait for next month.

**Q: Can I use multiple cloud names?**
A: Yes, but one account per project is recommended.

**Q: How to delete images?**
A: Use Media Library dashboard or API delete function.

---

## ✅ Checklist

- [ ] Created Cloudinary account
- [ ] Got API credentials
- [ ] Added to `.env.local`
- [ ] Restarted server
- [ ] Tested upload
- [ ] Checked console logs
- [ ] Verified in Cloudinary dashboard
- [ ] Images loading correctly
- [ ] No "Failed to save file" error

---

**🎉 Cloudinary setup complete! Images ab cloud mein store honge! ☁️**


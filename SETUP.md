# Setup Guide - 8rupiya.com

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.local` in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/8rupiya
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-this-to-a-random-secret-key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=your_google_adsense_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Services

**MongoDB:**
```bash
# If installed locally
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env.local
```

**Redis:**
```bash
# If installed locally
redis-server

# Or use Redis Cloud
# Update REDIS_URL in .env.local
```

### 4. Initialize Database

1. Start the dev server:
```bash
npm run dev
```

2. Create an admin user (via API or directly in MongoDB):
```bash
# POST to /api/auth/register with role: "admin"
```

3. Initialize default plans:
```bash
# POST to /api/admin/plans/init
# Requires admin authentication
```

### 5. Access the Application

- **Homepage**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Homepage Builder**: http://localhost:3000/admin/homepage-builder

## Database Collections

All collections are automatically created when first used:

- `users` - All user accounts
- `shops` - Shop listings
- `plans` - Subscription plans
- `payments` - Payment records
- `commissions` - Commission breakdowns
- `reviews` - Shop reviews
- `homepageblocks` - Homepage builder blocks
- `withdrawals` - Withdrawal requests

## Default Plans

After initialization, these plans will be available:

1. **Starter** - ₹100 (30 days)
2. **Basic** - ₹200 (30 days)
3. **Pro** - ₹3000 (90 days)
4. **Business** - ₹4000 (180 days)
5. **Enterprise** - ₹5000 (365 days)

## Testing the System

### 1. Register a Shopper
```bash
POST /api/auth/register
{
  "name": "Shop Owner",
  "email": "owner@example.com",
  "phone": "1234567890",
  "password": "password123",
  "role": "shopper"
}
```

### 2. Create a Shop
```bash
POST /api/shops
Headers: Authorization: Bearer <token>
{
  "name": "My Shop",
  "description": "Shop description",
  "category": "Retail",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "location": {
    "type": "Point",
    "coordinates": [72.8777, 19.0760] // [lng, lat]
  },
  "phone": "1234567890",
  "email": "shop@example.com"
}
```

### 3. Approve Shop (Admin)
```bash
POST /api/admin/shops/approve
Headers: Authorization: Bearer <admin_token>
{
  "shopId": "<shop_id>",
  "action": "approve"
}
```

### 4. Create Payment Order
```bash
POST /api/payments/create-order
Headers: Authorization: Bearer <token>
{
  "shopId": "<shop_id>",
  "planId": "<plan_id>"
}
```

### 5. Verify Payment (Webhook)
```bash
POST /api/payments/verify
{
  "razorpay_order_id": "...",
  "razorpay_payment_id": "...",
  "razorpay_signature": "..."
}
```

## Performance Optimization

### Redis Caching
- Shop listings are cached for 5 minutes
- Cache keys: `shops:nearby:{lat}:{lng}:{city}:{category}:{page}:{limit}`
- Cache is cleared when shops are updated/approved

### MongoDB Indexes
All critical indexes are already defined:
- Geospatial index on `shops.location`
- Indexes on `status`, `city`, `category`
- Indexes on `email`, `phone` for users
- Composite indexes for common queries

### CDN Setup
For production:
1. Use Cloudflare CDN
2. Configure static asset caching
3. Enable image optimization
4. Set up edge caching for API responses

## Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Use HTTPS in production
- [ ] Set secure cookie flags
- [ ] Enable CORS properly
- [ ] Validate all inputs
- [ ] Rate limit API endpoints
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Use Redis AUTH if exposed

## Production Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### VPS Deployment
1. Build: `npm run build`
2. Use PM2: `pm2 start npm --name "8rupiya" -- start`
3. Set up Nginx reverse proxy
4. Configure SSL with Let's Encrypt
5. Set up MongoDB and Redis (or use cloud services)

## Troubleshooting

### MongoDB Connection Issues
- Check if MongoDB is running
- Verify MONGODB_URI format
- Check network/firewall settings

### Redis Connection Issues
- Check if Redis is running
- Verify REDIS_URL format
- Check Redis authentication

### Payment Issues
- Verify Razorpay credentials
- Check webhook URL configuration
- Ensure payment signature verification

### Performance Issues
- Check Redis cache hit rate
- Monitor MongoDB query performance
- Review database indexes
- Check CDN configuration

## Support

For issues or questions, check the main README.md file.


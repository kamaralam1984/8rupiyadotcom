# 8rupiya.com - Location-Based Business Directory SaaS

A comprehensive location-based business directory platform with online shop onboarding, payment processing, and commission management.

## 🚀 Features

- **Location-Based Search**: Automatic nearby shop detection using GPS/IP
- **Multi-Role System**: Admin, Agent, Operator, Accountant, Shopper, User
- **Payment Plans**: 5 tiered plans (Starter ₹100 to Enterprise ₹5000)
- **Commission Engine**: Auto-calculates 20% agent, 10% operator, rest to company
- **Shop Approval Flow**: Pending → Admin Approval → Live
- **Ranking Algorithm**: Plan priority, distance, rating, freshness
- **Admin Homepage Builder**: Drag & drop homepage customization
- **Report System**: PDF and Excel exports
- **Google AdSense**: Integrated ad slots
- **Redis Caching**: <1 second load times
- **MongoDB**: Optimized indexes for performance
- **AI Assistant (Golu)**: Intelligent shop recommendations with natural language processing

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: MongoDB + Mongoose
- **Cache**: Redis
- **Payment**: Razorpay
- **Auth**: JWT
- **Export**: jsPDF + ExcelJS
- **UI**: Tailwind CSS

## 📦 Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/8rupiya
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=your_google_adsense_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key  # Optional: For AI-powered conversations
```

3. **Start MongoDB and Redis:**
```bash
# MongoDB (if installed locally)
mongod

# Redis (if installed locally)
redis-server
```

4. **Initialize default plans:**
```bash
# Make a POST request to /api/admin/plans/init (requires admin auth)
```

5. **Run development server:**
```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication
│   │   ├── shops/         # Shop CRUD & search
│   │   ├── payments/      # Payment processing
│   │   ├── admin/         # Admin operations
│   │   └── reports/       # Report exports
│   ├── admin/             # Admin dashboard pages
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── admin/            # Admin components
│   └── HomepageClient.tsx
├── lib/                   # Utilities
│   ├── mongodb.ts        # DB connection
│   ├── redis.ts          # Redis client
│   ├── auth.ts           # JWT auth
│   ├── razorpay.ts       # Payment integration
│   ├── ranking.ts        # Ranking algorithm
│   ├── commission.ts     # Commission calculation
│   └── location.ts       # Location utilities
├── models/               # Mongoose models
│   ├── User.ts
│   ├── Shop.ts
│   ├── Plan.ts
│   ├── Payment.ts
│   ├── Commission.ts
│   └── ...
└── middleware/           # Auth middleware
```

## 🔐 Roles & Permissions

- **Admin**: Full access, homepage builder, approvals
- **Agent**: Add shops, track commission, manage operators
- **Operator**: Add shops, view commission
- **Accountant**: View payments, exports, withdrawals
- **Shopper**: Manage own shop, payments
- **User**: Browse, search, reviews

## 💳 Payment Plans

| Plan | Price | Priority | Homepage | Featured | Expiry |
|------|-------|----------|----------|----------|--------|
| Starter | ₹100 | 1 | No | No | 30 days |
| Basic | ₹200 | 2 | No | No | 30 days |
| Pro | ₹3000 | 3 | Yes | Yes | 90 days |
| Business | ₹4000 | 4 | Yes | Yes | 180 days |
| Enterprise | ₹5000 | 5 | Yes | Yes | 365 days |

## 🔍 Ranking Algorithm

Shops are ranked by:
1. **Plan Priority** (40% weight)
2. **Manual Rank** (override if set)
3. **Featured Tag** (30% boost)
4. **Homepage Priority** (20% weight)
5. **Rating** (15% weight)
6. **Rank Score** (10% weight)
7. **Distance** (penalty for far shops)
8. **Freshness** (5% weight)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login

### Shops
- `GET /api/shops` - List shops
- `GET /api/shops/nearby` - Nearby shops (GPS/IP)
- `GET /api/shops/[id]` - Get shop
- `POST /api/shops` - Create shop
- `PUT /api/shops/[id]` - Update shop
- `DELETE /api/shops/[id]` - Delete shop

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

### Admin
- `POST /api/admin/shops/approve` - Approve/reject shop
- `POST /api/admin/plans/init` - Initialize plans
- `GET /api/admin/homepage-blocks` - Get homepage blocks
- `POST /api/admin/homepage-blocks` - Create block
- `PUT /api/admin/homepage-blocks` - Update block order

### Reports
- `POST /api/reports/export` - Export reports (PDF/Excel)

## 🚀 Deployment

### Vercel
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### VPS
1. Build: `npm run build`
2. Start: `npm start`
3. Use PM2 for process management
4. Set up Nginx reverse proxy
5. Configure MongoDB and Redis

## 📝 TODO

- [ ] Add shop image upload
- [ ] Implement review system
- [ ] Add email notifications
- [ ] SMS notifications for payments
- [ ] Advanced search filters
- [ ] Shop analytics dashboard
- [ ] Mobile app (React Native)

## 📄 License

MIT

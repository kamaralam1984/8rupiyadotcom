# 8rupiya.com - Complete Website Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Features](#features)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Database Schema](#database-schema)
6. [API Routes](#api-routes)
7. [Components Structure](#components-structure)
8. [Commission System](#commission-system)
9. [Payment Flow](#payment-flow)
10. [AI Assistant (Golu)](#ai-assistant-golu)
11. [Jyotish Platform](#jyotish-platform)
12. [Setup & Installation](#setup--installation)
13. [Environment Variables](#environment-variables)
14. [Deployment](#deployment)

---

## Project Overview

**8rupiya.com** is a comprehensive location-based business directory SaaS platform that enables businesses to list their shops online, manage subscriptions through tiered payment plans, and provides a multi-role commission management system. The platform also includes an AI-powered astrology platform (Jyotish) and an intelligent AI assistant (Golu) for shop recommendations.

### Key Highlights
- **Location-Based Search**: GPS/IP-based nearby shop detection
- **Multi-Role System**: 6 user roles with different permissions
- **Commission Engine**: Automated commission calculation and distribution
- **Payment Integration**: Razorpay payment gateway
- **AI Features**: OpenAI-powered chatbot and shop recommendations
- **Astrology Platform**: Complete Jyotish platform with kundli, chatbot, and marketplace
- **Admin Dashboard**: Comprehensive admin panel with analytics and management tools

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion 12.23.26
- **Charts**: Recharts 3.6.0
- **Icons**: React Icons 5.5.0
- **Internationalization**: i18next, react-i18next, next-i18next

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: MongoDB with Mongoose 9.0.2
- **Cache**: Redis 5.10.0
- **Authentication**: JWT (jsonwebtoken, jose)
- **Password Hashing**: bcryptjs 3.0.3

### Payment & Services
- **Payment Gateway**: Razorpay 2.9.6
- **AI Integration**: OpenAI API
- **Email**: Nodemailer 7.0.12
- **File Upload**: Custom upload handler
- **PDF Generation**: jsPDF 3.0.4, jsPDF-AutoTable 5.0.2
- **Excel Export**: ExcelJS 4.4.0

### Additional Libraries
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Maps**: @googlemaps/js-api-loader
- **Web Scraping**: Cheerio, Puppeteer
- **HTTP Client**: Axios 1.13.2
- **Carousel**: Swiper 12.0.3

---

## Features

### 1. Business Directory Features
- **Shop Listing**: Comprehensive shop profiles with images, location, contact info
- **Location-Based Search**: Automatic detection of nearby shops using GPS/IP
- **Category Filtering**: Filter shops by business category
- **Plan-Based Ranking**: Shops ranked by subscription plan priority
- **Featured Shops**: Highlighted shops on homepage
- **Shop Approval System**: Admin approval workflow for new shops
- **Shop Analytics**: Visitor tracking and analytics

### 2. Payment & Subscription System
- **5 Tiered Plans**: Starter (₹100) to Enterprise (₹5000)
- **Online Payments**: Razorpay integration
- **Cash Payments**: Manual payment entry for offline transactions
- **Plan Features**: Priority ranking, homepage visibility, featured tags
- **Expiry Management**: Automatic plan expiry tracking
- **Payment History**: Complete payment records for all users

### 3. Commission Management
- **Automatic Calculation**: Real-time commission calculation on payment
- **Multi-Level Commission**:
  - Agent: 20% of payment amount
  - Operator: 10% of remaining (after agent commission)
  - Company: Remaining amount
- **Commission Tracking**: Database-stored commission records
- **Commission Sync**: Automatic sync on user login
- **Commission Reports**: Detailed commission reports for agents and operators

### 4. Admin Dashboard
- **Key Metrics**: Total shops, active shops, revenue, agents, operators
- **Commission Overview**: Total agent, operator, and company revenue
- **Charts & Analytics**:
  - Revenue trends (6 months)
  - New shops (7 days)
  - Plan distribution
- **Pending Shops**: List of shops awaiting approval
- **Quick Actions**: Direct links to manage shops, agents, payments
- **Database Management**: Direct database access and management

### 5. AI Assistant (Golu)
- **Natural Language Processing**: Understands Hindi, English, and Hinglish
- **Shop Recommendations**: Intelligent shop suggestions based on queries
- **Category Detection**: Automatic category identification from user queries
- **OpenAI Integration**: General conversation support
- **Voice Input**: Speech-to-text functionality
- **Voice Output**: Text-to-speech responses
- **Context Awareness**: Understands user location and preferences

### 6. Jyotish Platform
- **AI Chatbot**: Hindi/Hinglish astrology chatbot
- **Kundli Generator**: Generate and download kundli charts
- **Pandit Marketplace**: Book expert astrologers
- **Jyotish Tools**:
  - Horoscope (Daily predictions)
  - Shudh Muhurat (Auspicious timings)
  - Numerology (Lucky numbers)
  - Kundli Match Making
- **Monetization**: Membership plans and consultation fees

### 7. User Management
- **Multi-Role System**: 6 distinct user roles
- **Role-Based Access Control**: Different permissions for each role
- **User Profiles**: Complete user profile management
- **Authentication**: JWT-based authentication
- **Password Management**: Reset, change password functionality
- **OTP Verification**: Email/SMS OTP for verification

### 8. Content Management
- **Homepage Builder**: Drag-and-drop homepage customization
- **Custom Pages**: Create and manage custom pages
- **Hero Settings**: Customizable hero section
- **Homepage Blocks**: Manage homepage content blocks
- **Advertisements**: Ad management system
- **Categories**: Business category management

---

## User Roles & Permissions

### 1. Admin
**Access**: Full system access
- Dashboard with complete analytics
- Shop approval/rejection
- User management (create, update, delete)
- Plan management
- Commission overview
- Payment management
- Database access
- Homepage builder
- Reports and exports
- Agent and operator management

**Routes**: `/admin/*`

### 2. Agent
**Access**: Shop creation and commission tracking
- Create shops for clients
- View own shops
- Track commission (20% of payments)
- View payments
- Manage operators
- View reports

**Routes**: `/agent/*`

### 3. Operator
**Access**: Shop management and commission tracking
- Create shops
- View assigned agents
- Track commission (10% of remaining)
- View payments
- Manage shoppers
- View agent statistics

**Routes**: `/operator/*`

### 4. Accountant
**Access**: Financial management
- View all payments
- Export reports (PDF/Excel)
- Commission tracking
- Withdrawal management
- Financial reports

**Routes**: `/accountant/*`

### 5. Shopper
**Access**: Own shop management
- Create own shop
- Manage shop details
- Make payments
- View payment history
- Update shop information

**Routes**: `/shopper/*`

### 6. User
**Access**: Browse and search
- Browse shops
- Search nearby shops
- View shop details
- Contact shops
- Leave reviews (if implemented)

**Routes**: Public routes

---

## Database Schema

### Models

#### 1. User Model
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  phone: string
  role: 'admin' | 'agent' | 'operator' | 'accountant' | 'shopper' | 'user'
  isActive: boolean
  agentId?: ObjectId (for operators)
  operatorId?: ObjectId (for shoppers)
  createdAt: Date
  updatedAt: Date
}
```

#### 2. Shop Model
```typescript
{
  name: string
  description: string
  category: string
  address: string
  area: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
  location: {
    type: 'Point'
    coordinates: [longitude, latitude]
  }
  images: string[]
  photos: string[]
  status: 'pending' | 'approved' | 'rejected' | 'active'
  paymentStatus: 'pending' | 'paid' | 'expired'
  paymentMode: 'online' | 'cash'
  planId: ObjectId
  planExpiry: Date
  agentId?: ObjectId
  operatorId?: ObjectId
  shopperId?: ObjectId
  rankScore: number
  isFeatured: boolean
  homepagePriority: number
  visitors: number
  createdAt: Date
  updatedAt: Date
}
```

#### 3. Plan Model
```typescript
{
  name: string
  price: number
  duration: number (days)
  expiryDays: number
  priority: number
  rank: number
  featuredTag: boolean
  listingPriority: number
  homepageVisibility: boolean
  isActive: boolean
  seoEnabled: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### 4. Payment Model
```typescript
{
  shopId: ObjectId
  planId: ObjectId
  amount: number
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  status: 'pending' | 'success' | 'failed' | 'refunded'
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

#### 5. Commission Model
```typescript
{
  paymentId: ObjectId
  shopId: ObjectId
  agentId?: ObjectId
  operatorId?: ObjectId
  agentAmount: number (20% of payment)
  operatorAmount: number (10% of remaining)
  companyAmount: number (remaining)
  totalAmount: number
  status: 'pending' | 'paid' | 'withdrawn'
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

#### 6. AgentRequest Model
```typescript
{
  agentId: ObjectId
  operatorId: ObjectId
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
}
```

#### 7. Advertisement Model
```typescript
{
  title: string
  description: string
  image: string
  link: string
  position: string
  isActive: boolean
  clicks: number
  impressions: number
  createdAt: Date
  updatedAt: Date
}
```

#### 8. HomepageBlock Model
```typescript
{
  type: string
  title: string
  content: object
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### 9. CustomPage Model
```typescript
{
  slug: string (unique)
  title: string
  content: PageComponent[]
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### 10. Review Model
```typescript
{
  shopId: ObjectId
  userId: ObjectId
  rating: number (1-5)
  comment: string
  createdAt: Date
  updatedAt: Date
}
```

#### 11. JyotishPandit Model
```typescript
{
  name: string
  experience: number
  rating: number
  specialties: string[]
  languages: string[]
  plan: 'free' | 'silver' | 'gold' | 'premium'
  phone?: string
  videoAvailable: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### 12. AIInteraction Model
```typescript
{
  userId?: ObjectId
  query: string
  response: string
  language: 'hi' | 'en' | 'hinglish'
  category?: string
  shopIds?: ObjectId[]
  createdAt: Date
}
```

---

## API Routes

### Authentication Routes (`/api/auth/*`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/[...nextauth]` - NextAuth handler

### Shop Routes (`/api/shops/*`)
- `GET /api/shops` - List all shops (with filters)
- `GET /api/shops/nearby` - Get nearby shops (location-based)
- `GET /api/shops/[id]` - Get shop details
- `POST /api/shops` - Create shop
- `PUT /api/shops/[id]` - Update shop
- `DELETE /api/shops/[id]` - Delete shop

### Payment Routes (`/api/payments/*`)
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment and create commission
- `POST /api/payments/cash` - Record cash payment

### Admin Routes (`/api/admin/*`)
- `GET /api/admin/dashboard` - Admin dashboard data
- `POST /api/admin/init` - Initialize admin user
- `GET /api/admin/operators` - List all operators
- `GET /api/admin/agents/stats` - Agent statistics
- `POST /api/admin/shops/approve` - Approve/reject shop
- `GET /api/admin/users` - List users
- `POST /api/admin/users/create` - Create user
- `PUT /api/admin/users/update` - Update user
- `DELETE /api/admin/users/delete` - Delete user
- `GET /api/admin/database/collections` - List collections
- `GET /api/admin/database/documents` - Get documents
- `POST /api/admin/fix-commissions` - Fix missing commissions
- `GET /api/admin/homepage-blocks` - Get homepage blocks
- `POST /api/admin/homepage-blocks` - Create homepage block
- `PUT /api/admin/homepage-blocks` - Update block order
- `GET /api/admin/homepage-layouts` - Get homepage layouts
- `POST /api/admin/hero-settings` - Update hero settings
- `GET /api/admin/pages` - List custom pages
- `POST /api/admin/pages` - Create custom page
- `GET /api/admin/categories` - List categories
- `POST /api/admin/categories` - Create category
- `GET /api/admin/advertisements` - List advertisements
- `POST /api/admin/advertisements` - Create advertisement

### Agent Routes (`/api/agent/*`)
- `GET /api/agent/dashboard` - Agent dashboard data
- `GET /api/agent/shops` - Agent's shops
- `POST /api/agent/shop/create` - Create shop
- `GET /api/agent/payments` - Agent's payments
- `GET /api/agent/commissions` - Agent's commissions
- `GET /api/agent/operators` - Agent's operators
- `GET /api/agent/plans` - Available plans

### Operator Routes (`/api/operator/*`)
- `GET /api/operator/dashboard` - Operator dashboard data
- `GET /api/operator/shops` - Operator's shops
- `GET /api/operator/payments` - Operator's payments
- `GET /api/operator/agents` - Operator's agents
- `POST /api/operator/agents/request` - Request agent
- `GET /api/operator/shoppers` - Operator's shoppers
- `POST /api/operator/shoppers/create` - Create shopper
- `GET /api/operator/profile` - Operator profile

### Shopper Routes (`/api/shopper/*`)
- `GET /api/shopper/dashboard` - Shopper dashboard
- `GET /api/shopper/shops` - Shopper's shops
- `POST /api/shopper/shop/create` - Create shop
- `GET /api/shopper/payments` - Shopper's payments
- `GET /api/shopper/profile` - Shopper profile

### AI Routes (`/api/ai/*`)
- `POST /api/ai/recommend` - Get shop recommendations (Golu)
- `POST /api/ai/interaction` - Save AI interaction

### Plan Routes (`/api/plans/*`)
- `GET /api/plans` - List all plans
- `POST /api/plans/init` - Initialize default plans

### Report Routes (`/api/reports/*`)
- `POST /api/reports/export` - Export reports (PDF/Excel)

### Other Routes
- `GET /api/categories` - List categories
- `GET /api/distance` - Calculate distance
- `GET /api/health` - Health check
- `POST /api/upload` - File upload
- `GET /api/pages/[slug]` - Get custom page
- `GET /api/advertisements/[id]/click` - Track ad click
- `GET /api/hero-settings` - Get hero settings
- `GET /api/homepage-layout` - Get homepage layout

---

## Components Structure

### Admin Components (`src/components/admin/`)
- `AdminDashboard.tsx` - Main admin dashboard
- `AdminLayout.tsx` - Admin sidebar and layout
- Other admin-specific components

### Agent Components (`src/components/agent/`)
- `AgentDashboard.tsx` - Agent dashboard
- `AgentLayout.tsx` - Agent sidebar
- `AgentShopsPage.tsx` - Shop management
- `AgentCommissionsPage.tsx` - Commission tracking
- `AgentWorkDetailsPage.tsx` - Work details

### Operator Components (`src/components/operator/`)
- `OperatorDashboard.tsx` - Operator dashboard
- `OperatorLayout.tsx` - Operator sidebar
- `OperatorPaymentsPage.tsx` - Payment management

### Shopper Components (`src/components/shopper/`)
- `ShopperLayout.tsx` - Shopper sidebar
- Shopper-specific components

### Shared Components
- `AIAssistant.tsx` - Golu AI assistant widget
- `HomepageClient.tsx` - Main homepage
- `ThemeToggle.tsx` - Dark/light mode toggle
- `LoginClient.tsx` - Login page
- `RegisterClient.tsx` - Registration page

### Jyotish Components (`src/components/jyotish/`)
- `JyotishNav.tsx` - Navigation
- `JyotishFooter.tsx` - Footer
- Jyotish-specific components

---

## Commission System

### Commission Calculation

When a payment is successful:
1. **Agent Commission**: 20% of total payment amount
2. **Remaining Amount**: Payment amount - Agent commission
3. **Operator Commission**: 10% of remaining amount
4. **Company Revenue**: Remaining amount - Operator commission

### Example
Payment: ₹10,000
- Agent Commission: ₹2,000 (20%)
- Remaining: ₹8,000
- Operator Commission: ₹800 (10% of ₹8,000)
- Company Revenue: ₹7,200

### Commission Flow

1. **Payment Success** → `createCommission()` function called
2. **Find Operator**: If shop doesn't have operatorId, find from AgentRequest
3. **Calculate Breakdown**: Calculate agent, operator, and company amounts
4. **Save to Database**: Create Commission record
5. **Update Shop**: Update shop status and plan details

### Commission Sync

On user login:
- `syncUserCommissions()` function runs in background
- Checks for missing commissions
- Updates commissions with missing operatorId
- Recalculates if needed

### Commission Endpoints

- `GET /api/agent/commissions` - Agent's commission list
- `GET /api/operator/dashboard` - Operator's total commission
- `GET /api/admin/dashboard` - All commission totals
- `POST /api/admin/fix-commissions` - Fix missing commissions

---

## Payment Flow

### Online Payment (Razorpay)

1. **Create Order**
   - User selects plan
   - `POST /api/payments/create-order`
   - Returns Razorpay order ID

2. **Payment Processing**
   - User completes payment on Razorpay
   - Razorpay redirects with payment details

3. **Verify Payment**
   - `POST /api/payments/verify`
   - Verify Razorpay signature
   - Update payment status
   - Create commission record
   - Update shop status and plan

### Cash Payment

1. **Record Payment**
   - Admin/Agent records cash payment
   - `POST /api/payments/cash`
   - Create payment record
   - Create commission record
   - Update shop status

### Payment Status Flow

```
Pending → Success → Commission Created → Shop Activated
   ↓
Failed/Refunded
```

---

## AI Assistant (Golu)

### Features

1. **Natural Language Understanding**
   - Detects language (Hindi, English, Hinglish)
   - Extracts category from query
   - Identifies intent (cheap, best, nearby)

2. **Shop Recommendations**
   - Searches database by category
   - Ranks shops by plan, distance, rating
   - Returns top recommendations

3. **OpenAI Integration**
   - General conversations
   - Query understanding
   - Category suggestion if not detected

4. **Voice Features**
   - Speech-to-text input
   - Text-to-speech output
   - Microphone button for voice input

### API Endpoint

`POST /api/ai/recommend`

**Request:**
```json
{
  "query": "kapda dukaan",
  "language": "hi",
  "userLocation": {
    "latitude": 25.5941,
    "longitude": 85.1376
  },
  "userId": "user_id"
}
```

**Response:**
```json
{
  "success": true,
  "response": "I found clothing shops near you...",
  "shops": [...],
  "category": "clothing"
}
```

---

## Jyotish Platform

### Features

1. **AI Chatbot** (`/jyotish/chatbot`)
   - Hindi/Hinglish astrology chatbot
   - Voice input support
   - Career, marriage, health, finance guidance

2. **Kundli Generator** (`/jyotish/kundli`)
   - Generate kundli charts
   - PDF download
   - Detailed planetary information

3. **Pandit Marketplace** (`/jyotish/marketplace`)
   - Expert astrologer listings
   - Plan-based filtering
   - Booking system

4. **Jyotish Toolset** (`/jyotish/toolset`)
   - Horoscope (Daily predictions)
   - Shudh Muhurat (Auspicious timings)
   - Numerology (Lucky numbers)
   - Kundli Match Making

### Models

- `JyotishPandit` - Astrologer profiles
- `JyotishBooking` - Consultation bookings

---

## Setup & Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- Redis 6+
- npm or yarn

### Installation Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd 8rupiyadotcom
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Variables**
Create `.env.local` file (see Environment Variables section)

4. **Start Services**
```bash
# MongoDB
mongod

# Redis
redis-server
```

5. **Initialize Database**
```bash
# Create admin user
npm run create-admin

# Initialize plans
# POST to /api/admin/plans/init (requires admin auth)
```

6. **Run Development Server**
```bash
npm run dev
```

7. **Access Application**
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin
- Agent: http://localhost:3000/agent
- Operator: http://localhost:3000/operator

---

## Environment Variables

Create `.env.local` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/8rupiya
# Or MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/8rupiya

# Redis Cache
REDIS_URL=redis://localhost:6379
# Or Redis Cloud: redis://user:pass@host:port

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NEXTAUTH_SECRET=your-nextauth-secret-key

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google Services
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=your_google_adsense_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@8rupiya.com
```

---

## Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

2. **Import to Vercel**
   - Go to vercel.com
   - Import GitHub repository
   - Add environment variables
   - Deploy

3. **Configure**
   - Add MongoDB Atlas connection string
   - Add Redis Cloud URL
   - Add all environment variables
   - Configure custom domain

### VPS Deployment

1. **Build Application**
```bash
npm run build
```

2. **Start Production Server**
```bash
npm start
```

3. **Use PM2 for Process Management**
```bash
npm install -g pm2
pm2 start npm --name "8rupiya" -- start
pm2 save
pm2 startup
```

4. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **SSL Certificate (Let's Encrypt)**
```bash
sudo certbot --nginx -d your-domain.com
```

### Database Setup (Production)

1. **MongoDB Atlas**
   - Create cluster
   - Whitelist IP addresses
   - Get connection string
   - Update MONGODB_URI

2. **Redis Cloud**
   - Create database
   - Get connection URL
   - Update REDIS_URL

---

## Key Features Summary

### Business Directory
✅ Location-based shop search
✅ Category filtering
✅ Plan-based ranking
✅ Shop approval workflow
✅ Payment integration
✅ Commission management

### User Management
✅ Multi-role system (6 roles)
✅ JWT authentication
✅ Role-based access control
✅ User profile management

### Admin Features
✅ Comprehensive dashboard
✅ Shop management
✅ User management
✅ Commission tracking
✅ Payment management
✅ Database access
✅ Homepage builder
✅ Reports and exports

### AI Features
✅ Golu AI assistant
✅ Natural language processing
✅ Voice input/output
✅ Shop recommendations
✅ OpenAI integration

### Jyotish Platform
✅ AI chatbot
✅ Kundli generator
✅ Pandit marketplace
✅ Jyotish tools

### Payment System
✅ Razorpay integration
✅ Cash payment support
✅ Plan management
✅ Automatic commission calculation

---

## File Structure

```
8rupiyadotcom/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin pages
│   │   ├── agent/             # Agent pages
│   │   ├── operator/          # Operator pages
│   │   ├── shopper/           # Shopper pages
│   │   ├── jyotish/           # Jyotish platform
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── admin/            # Admin components
│   │   ├── agent/            # Agent components
│   │   ├── operator/          # Operator components
│   │   ├── shopper/          # Shopper components
│   │   ├── jyotish/          # Jyotish components
│   │   └── ...               # Shared components
│   ├── lib/                   # Utilities
│   │   ├── mongodb.ts        # Database connection
│   │   ├── redis.ts          # Redis client
│   │   ├── auth.ts           # Authentication
│   │   ├── commission.ts     # Commission calculation
│   │   ├── commission-sync.ts # Commission sync
│   │   └── ...               # Other utilities
│   ├── models/               # Mongoose models
│   │   ├── User.ts
│   │   ├── Shop.ts
│   │   ├── Plan.ts
│   │   ├── Payment.ts
│   │   ├── Commission.ts
│   │   └── ...
│   ├── types/                # TypeScript types
│   └── contexts/             # React contexts
├── public/                   # Static files
├── .env.local               # Environment variables
├── package.json             # Dependencies
├── README.md                # Basic README
├── WEBSITE_DOCUMENTATION.md # This file
└── ...
```

---

## Important Notes

1. **Commission Calculation**: Automatically calculated on payment success
2. **Commission Sync**: Runs on user login to fix missing commissions
3. **Operator Commission**: Only calculated if operatorId exists in shop or AgentRequest
4. **Payment Verification**: Always verify Razorpay signature before processing
5. **Shop Approval**: All shops start as 'pending', require admin approval
6. **Plan Expiry**: Automatically tracked, shops expire when plan expires
7. **Redis Caching**: Used for shop listings to improve performance
8. **Location Search**: Uses MongoDB geospatial queries for nearby shops
9. **AI Assistant**: Requires OPENAI_API_KEY for full functionality
10. **Database Indexes**: Ensure proper indexes on frequently queried fields

---

## Support & Maintenance

### Common Issues

1. **Commission showing 0**
   - Run `/api/admin/fix-commissions` endpoint
   - Check if operatorId is set in shops
   - Verify AgentRequest approvals

2. **Payment not processing**
   - Check Razorpay credentials
   - Verify webhook configuration
   - Check payment status in database

3. **Shops not appearing**
   - Check shop status (must be 'approved' or 'active')
   - Verify plan expiry
   - Check Redis cache

4. **Login issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Verify user isActive status

### Regular Maintenance

1. **Database Cleanup**
   - Remove expired plans
   - Archive old payments
   - Clean up inactive users

2. **Cache Management**
   - Clear Redis cache periodically
   - Update cache on data changes

3. **Backup**
   - Regular MongoDB backups
   - Backup user data
   - Backup payment records

---

## Version Information

- **Next.js**: 16.1.1
- **React**: 19.2.3
- **MongoDB**: 9.0.2 (Mongoose)
- **Node.js**: 18+ recommended
- **Last Updated**: December 2024

---

## License

MIT License

---

## Contact

For support or questions:
- Email: support@8rupiya.com
- Documentation: This file
- GitHub: [Repository URL]

---

**End of Documentation**




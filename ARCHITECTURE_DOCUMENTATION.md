# 8 Rupiya - पूरी Architecture और Database Connection Guide

## 📋 Table of Contents
1. [Frontend Architecture](#1-frontend-architecture)
2. [Database Structure](#2-database-structure)
3. [API Routes और Database Connection](#3-api-routes-और-database-connection)
4. [Admin Panel Structure](#4-admin-panel-structure)
5. [Dusre Database Se Link Karne Ka Method](#5-dusre-database-se-link-karne-ka-method)

---

## 1. Frontend Architecture

### 1.1 Homepage Structure (`app/page.tsx`)

```
Homepage Layout:
├── NavbarAirbnb (Top Navigation)
├── FeaturedShopsSlider (Featured Shops)
├── HeroFeaturedBusinesses (Hero Section)
├── AdSlider (Promotional Ads)
├── ShopSection (Most Rated Shops)
├── FlashSpotlight (Limited Offers)
├── ShopSection (Most Reviewed Shops)
├── DiscoverSection (Category Tiles)
├── BusinessesGrid (All Listings with Filters)
└── FooterMinimal (Footer)
```

### 1.2 Main Components (`app/components/`)

| Component | Purpose | API Used |
|-----------|---------|----------|
| `NavbarAirbnb.tsx` | Top navigation with search | `/api/categories` |
| `FeaturedShopsSlider.tsx` | Horizontal scrolling featured shops | `/api/shops/by-plan?planType=FEATURED` |
| `HeroFeaturedBusinesses.tsx` | Hero section with featured businesses | `/api/shops/nearby` |
| `ShopSection.tsx` | Display shops with sorting | `/api/shops/nearby` |
| `BusinessesGrid.tsx` | Main grid of all businesses | `/api/shops/nearby` |
| `ShopCard.tsx` | Individual shop card display | - |
| `ShopDetailsModal.tsx` | Shop details popup | `/api/shops/[id]` |

### 1.3 Context Providers (`app/contexts/`)

#### **LocationContext** (`LocationContext.tsx`)
- **Purpose**: User की location store करता है (latitude, longitude, city, area, pincode)
- **Data Flow**:
  1. Page load पर browser geolocation detect करता है
  2. अगर geolocation नहीं मिला तो default location (Patna) use करता है
  3. Location localStorage में save होता है
- **Usage**: `const { location, setLocation } = useLocation();`

#### **SearchContext** (`SearchContext.tsx`)
- **Purpose**: Search filters store करता है (category, pincode, city, shopName, area)
- **Data Flow**:
  1. User search करता है (category/pincode/city select करता है)
  2. SearchContext update होता है
  3. Components automatically re-fetch करते हैं filtered data
- **Usage**: `const { searchParams, setSearchParams, isSearchActive } = useSearch();`

#### **AuthContext** (`AuthContext.tsx`)
- **Purpose**: Admin user authentication
- **API**: `/api/auth/me`, `/api/auth/login`

#### **AgentAuthContext** (`AgentAuthContext.tsx`)
- **Purpose**: Agent authentication
- **API**: `/api/agent/auth/login`, `/api/agent/me`

### 1.4 Frontend से Database तक Data Flow

```
User Action (Frontend)
    ↓
Component Event Handler
    ↓
API Call (fetch to /api/...)
    ↓
API Route Handler (app/api/.../route.ts)
    ↓
connectDB() (lib/mongodb.ts)
    ↓
MongoDB Model (lib/models/...)
    ↓
MongoDB Collection (Database)
    ↓
Response (JSON)
    ↓
Component State Update
    ↓
UI Re-render
```

### 1.5 Key Frontend Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Homepage (main entry point) |
| `app/layout.tsx` | Root layout with providers |
| `app/components/*.tsx` | Reusable UI components |
| `app/contexts/*.tsx` | Global state management |
| `app/utils/*.ts` | Utility functions |
| `app/hooks/useUserLocation.ts` | Custom hooks |

---

## 2. Database Structure

### 2.1 MongoDB Connection (`lib/mongodb.ts`)

**Connection Setup**:
```typescript
MONGODB_URI = process.env.MONGODB_URI
// Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Connection Features**:
- Connection caching (hot reload के लिए)
- Auto-reconnect on failure
- SSL/TLS enabled
- Connection pooling (max 20 connections)

### 2.2 Main Database Collections (Tables)

#### **1. Shops Collections**

##### **`shops` Collection** (Old/Existing Database)
```javascript
{
  _id: ObjectId,
  name: String,                    // Shop name (not shopName!)
  category: String,
  description: String,
  address: String,
  city: String,
  area: String,
  state: String,
  pincode: String,
  phone: String,                   // Not mobile!
  email: String,
  website: String,
  location: {                      // GeoJSON Point format
    type: "Point",
    coordinates: [longitude, latitude]  // Note: [lng, lat] not [lat, lng]
  },
  images: [String],                // Array of image URLs
  photos: [String],                // Alternative images
  status: String,                  // "approved" or "pending"
  paymentStatus: String,           // "paid" or "pending" (lowercase)
  planId: ObjectId,
  visitorCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```
**Model**: N/A (direct collection access)
**API Routes**: `/api/shops/nearby` (modified to support both)

##### **`agentshops` Collection** (AgentShop Model)
```javascript
{
  _id: ObjectId,
  shopName: String,                // Note: shopName, not name
  ownerName: String,
  mobile: String,                  // Note: mobile, not phone
  countryCode: String,
  email: String,
  category: String,
  pincode: String,
  area: String,
  address: String,
  photoUrl: String,                // Single image URL
  additionalPhotos: [String],      // Additional photos (max 9)
  shopUrl: String,
  latitude: Number,                // Direct lat/lng, not GeoJSON
  longitude: Number,
  paymentStatus: String,           // "PAID" or "PENDING" (uppercase)
  paymentMode: String,             // "CASH", "UPI", "NONE"
  receiptNo: String,
  amount: Number,
  planType: String,                // "BASIC", "PREMIUM", "FEATURED", etc.
  planAmount: Number,
  district: String,
  agentId: ObjectId,
  shopperId: ObjectId,
  visitorCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```
**Model**: `lib/models/AgentShop.ts`
**API Routes**: `/api/agent/shops/*`, `/api/shops/nearby`

##### **`shopsfromimage` Collection** (AdminShop Model)
```javascript
{
  _id: ObjectId,
  shopName: String,
  ownerName: String,
  category: String,
  mobile: String,
  fullAddress: String,
  city: String,
  area: String,
  pincode: String,
  latitude: Number,
  longitude: Number,
  photoUrl: String,
  iconUrl: String,
  shopUrl: String,
  createdByAdmin: ObjectId,
  createdByAgent: ObjectId,
  paymentStatus: String,           // "PAID" or "PENDING"
  planType: String,
  isVisible: Boolean,
  createdAt: Date
}
```
**Model**: `lib/models/Shop.ts` (collection name: 'shopsfromimage')
**API Routes**: `/api/admin/shops/*`

#### **2. Categories Collection**

##### **`categories` Collection**
```javascript
{
  _id: ObjectId,
  name: String,                    // "Restaurants", "Hotels", etc.
  slug: String,                    // "restaurants", "hotels"
  description: String,
  icon: String,                    // Icon URL
  isActive: Boolean,
  displayOrder: Number,
  createdAt: Date,
  updatedAt: Date
}
```
**Model**: Check `models/Category.ts` or `lib/models/`
**API Routes**: `/api/categories`

#### **3. Users Collections**

##### **`users` Collection** (Admin Users)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  role: String,                    // "admin"
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
**Model**: `models/User.ts`

##### **`agents` Collection** (Agent Users)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  agentCode: String,               // Unique agent code
  passwordHash: String,
  isActive: Boolean,
  operatorId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```
**Model**: `lib/models/Agent.ts`

##### **`shoppers` Collection** (Shopper Users)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  passwordHash: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
**Model**: `lib/models/Shopper.ts`

#### **4. Other Important Collections**

##### **`seo` Collection** (SEO Rankings)
```javascript
{
  _id: ObjectId,
  shopId: ObjectId,
  shopName: String,
  category: String,
  area: String,
  pincode: String,
  ranking: Number,                 // Lower = better rank
  createdAt: Date
}
```
**Model**: `lib/models/SEO.ts`
**API Routes**: `/api/seo`

##### **`revenues` Collection** (Revenue Tracking)
```javascript
{
  _id: ObjectId,
  shopId: ObjectId,
  shopName: String,
  amount: Number,
  planType: String,
  agentId: ObjectId,
  agentCommission: Number,
  district: String,
  date: Date,
  createdAt: Date
}
```
**Model**: `lib/models/Revenue.ts`

##### **`reviews` Collection** (Shop Reviews)
```javascript
{
  _id: ObjectId,
  shopId: ObjectId,
  shopName: String,
  rating: Number,                  // 1-5
  review: String,
  reviewerName: String,
  createdAt: Date
}
```
**Model**: `lib/models/Review.ts`

---

## 3. API Routes और Database Connection

### 3.1 Main API Routes Structure

```
app/api/
├── shops/
│   ├── nearby/route.ts           # Main shop fetching (supports both collections)
│   ├── [id]/route.ts             # Get single shop
│   ├── search-options/route.ts   # Search filters
│   └── by-plan/route.ts          # Shops by plan type
├── categories/
│   └── route.ts                  # All categories
├── admin/
│   ├── shops/route.ts            # Admin shop management
│   ├── categories/route.ts       # Category management
│   └── database/                 # Database viewer
├── agent/
│   ├── shops/route.ts            # Agent shop management
│   └── dashboard/route.ts        # Agent dashboard
└── auth/
    ├── login/route.ts            # Admin login
    └── me/route.ts               # Get current user
```

### 3.2 API Route Pattern

**Example**: `/api/shops/nearby/route.ts`

```typescript
// 1. Import dependencies
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AgentShop from '@/lib/models/AgentShop';
import mongoose from 'mongoose';

// 2. Connect to database
await connectDB();

// 3. Get database connection
const connection = mongoose.connection;
const shopsCollection = connection.db?.collection('shops');

// 4. Query AgentShop model
const agentShops = await AgentShop.find({ /* filters */ }).lean();

// 5. Query direct collection (for different structure)
const shopsFromDB = await shopsCollection
  .find({ /* filters */ })
  .toArray();

// 6. Map/Transform data to frontend format
const shops = [...agentShopsList, ...shopsFromCollection].map(shop => ({
  id: shop._id.toString(),
  name: shop.shopName || shop.name,
  // ... other fields
}));

// 7. Return JSON response
return NextResponse.json({ success: true, shops });
```

### 3.3 Key API Routes और उनके Database Queries

#### **`GET /api/shops/nearby`** (Main Shop Fetching)
- **Queries**: 
  - `agentshops` collection (via AgentShop model)
  - `shops` collection (direct access)
- **Filters**: city, area, pincode, category, shopName, paymentStatus
- **Response**: Array of shops with distance calculation

#### **`GET /api/categories`**
- **Query**: `categories` collection
- **Response**: All active categories

#### **`GET /api/admin/shops`**
- **Query**: `shopsfromimage` collection (via Shop model)
- **Response**: All shops for admin panel

#### **`GET /api/agent/shops`**
- **Query**: `agentshops` collection (via AgentShop model)
- **Filter**: By `agentId`
- **Response**: Agent's shops

---

## 4. Admin Panel Structure

### 4.1 Admin Panel Routes (`app/(admin)/admin/`)

```
admin/
├── page.tsx                      # Admin Dashboard
├── shops/
│   ├── page.tsx                  # Shops List
│   ├── new/page.tsx              # Create Shop
│   └── [id]/route.ts             # Edit Shop
├── categories/
│   └── page.tsx                  # Categories Management
├── database/
│   └── page.tsx                  # Database Viewer
└── reports/
    └── page.tsx                  # Reports
```

### 4.2 Admin Panel Data Flow

```
Admin Panel Component
    ↓
API Call (with Authorization token)
    ↓
API Route (requireAdmin middleware)
    ↓
Database Query (Admin-only collections)
    ↓
Response
    ↓
Admin Panel UI Update
```

### 4.3 Admin Authentication

**Login Flow**:
1. Admin `/admin/login` page पर login करता है
2. Credentials `/api/auth/login` को send होते हैं
3. Server `users` collection में check करता है
4. JWT token generate होता है
5. Token localStorage में save होता है
6. Subsequent requests में token header में send होता है

**Auth Middleware**: `lib/auth.ts` → `requireAdmin()`

---

## 5. Dusre Database Se Link Karne Ka Method

### 5.1 Step-by-Step Guide

#### **Step 1: MongoDB URI Change करें**

`.env.local` file में:
```env
# Old Database
# MONGODB_URI=mongodb+srv://old-user:old-pass@old-cluster.mongodb.net/old-db

# New Database
MONGODB_URI=mongodb+srv://new-user:new-pass@new-cluster.mongodb.net/new-db
```

#### **Step 2: Collection Names Check करें**

New database में shops किस collection में हैं, check करें:

**Method 1: Admin Panel Se**
```
1. Admin Panel खोलें: /admin/database
2. "collections" देखें
3. Shop collection का name note करें (e.g., "shops", "businesses", etc.)
```

**Method 2: Script Se**
```typescript
// scripts/check-collections.ts बनाएं
const collections = await connection.db.listCollections().toArray();
console.log(collections.map(c => ({ name: c.name, count: await db.collection(c.name).countDocuments() })));
```

#### **Step 3: Collection Structure Map करें**

New database के shop structure को existing structure से map करें:

**Existing Structure** (AgentShop):
```javascript
{
  shopName: String,
  mobile: String,
  latitude: Number,
  longitude: Number,
  photoUrl: String
}
```

**New Database Structure** (अगर अलग है):
```javascript
{
  name: String,        // shopName की जगह name
  phone: String,       // mobile की जगह phone
  location: {          // latitude/longitude की जगह GeoJSON
    coordinates: [lng, lat]
  },
  images: [String]     // photoUrl की जगह images array
}
```

#### **Step 4: API Routes Update करें**

**File**: `app/api/shops/nearby/route.ts`

**Existing Code**:
```typescript
// AgentShop से fetch
const agentShops = await AgentShop.find({...});

// shops collection से fetch (already added)
const shopsCollection = connection.db?.collection('shops');
const shopsFromDB = await shopsCollection.find({...}).toArray();
```

**New Database के लिए Add करें**:
```typescript
// New database collection से fetch
const newShopsCollection = connection.db?.collection('new-collection-name');
const newShops = await newShopsCollection.find({
  status: 'approved',
  paymentStatus: { $in: ['paid', 'PAID'] }
}).toArray();

// Map to common format
const mappedNewShops = newShops.map(shop => ({
  id: shop._id.toString(),
  name: shop.name || shop.shopName,           // Map field names
  shopName: shop.name || shop.shopName,
  category: shop.category,
  photoUrl: shop.images?.[0] || shop.photoUrl, // Map image field
  imageUrl: shop.images?.[0] || shop.photoUrl,
  latitude: shop.location?.coordinates?.[1] || shop.latitude, // Map coordinates
  longitude: shop.location?.coordinates?.[0] || shop.longitude,
  phone: shop.phone || shop.mobile,
  mobile: shop.phone || shop.mobile,
  // ... other fields
}));

// Merge all collections
shops = [...agentShopsList, ...shopsFromCollection, ...mappedNewShops];
```

#### **Step 5: Model Update (Optional)**

अगर आप consistently नई collection use करना चाहते हैं, तो नया Model बनाएं:

**File**: `lib/models/NewShop.ts`
```typescript
import mongoose, { Schema } from 'mongoose';

const NewShopSchema = new Schema({
  name: String,        // या जो भी field name है
  category: String,
  // ... new database structure के अनुसार
}, {
  collection: 'new-collection-name',  // Actual collection name
  timestamps: true
});

export default mongoose.models.NewShop || mongoose.model('NewShop', NewShopSchema);
```

**Usage**:
```typescript
import NewShop from '@/lib/models/NewShop';
const shops = await NewShop.find({...});
```

#### **Step 6: Field Mapping Utility Function (Recommended)**

**File**: `lib/utils/shopMapper.ts` (नया बनाएं)
```typescript
/**
 * Map shop from different database structures to common format
 */
export function mapShopToCommonFormat(shop: any, source: 'agentshops' | 'shops' | 'new-collection') {
  switch(source) {
    case 'agentshops':
      return {
        id: shop._id.toString(),
        name: shop.shopName,
        shopName: shop.shopName,
        photoUrl: shop.photoUrl,
        latitude: shop.latitude,
        longitude: shop.longitude,
        phone: shop.mobile,
        // ... AgentShop structure
      };
    
    case 'shops':
      return {
        id: shop._id.toString(),
        name: shop.name,
        shopName: shop.name,
        photoUrl: shop.images?.[0] || shop.photos?.[0],
        latitude: shop.location?.coordinates?.[1],
        longitude: shop.location?.coordinates?.[0],
        phone: shop.phone,
        // ... shops collection structure
      };
    
    case 'new-collection':
      return {
        id: shop._id.toString(),
        name: shop.name || shop.businessName,  // Multiple possible fields
        shopName: shop.name || shop.businessName,
        photoUrl: shop.imageUrl || shop.logo || shop.images?.[0],
        latitude: shop.lat || shop.location?.lat || shop.coordinates?.lat,
        longitude: shop.lng || shop.location?.lng || shop.coordinates?.lng,
        phone: shop.phone || shop.mobile || shop.contact,
        // ... new collection structure
      };
    
    default:
      return shop;
  }
}
```

**Usage**:
```typescript
import { mapShopToCommonFormat } from '@/lib/utils/shopMapper';

const newShops = await newCollection.find({...}).toArray();
const mappedShops = newShops.map(shop => mapShopToCommonFormat(shop, 'new-collection'));
```

### 5.2 Important Points

1. **Collection Name अलग हो सकता है**: 
   - Check करें actual collection name क्या है
   - Model में `collection: 'actual-name'` specify करें

2. **Field Names अलग हो सकते हैं**:
   - `shopName` vs `name`
   - `mobile` vs `phone`
   - `photoUrl` vs `images[0]` vs `imageUrl`

3. **Coordinates Format अलग हो सकता है**:
   - Direct: `{ latitude: 25.5, longitude: 85.1 }`
   - GeoJSON: `{ location: { type: "Point", coordinates: [85.1, 25.5] } }`
   - Nested: `{ coordinates: { lat: 25.5, lng: 85.1 } }`

4. **Payment Status Format**:
   - `"paid"` vs `"PAID"`
   - `"approved"` vs `"active"`
   - Check करें कौन सा format use हो रहा है

5. **Multiple Collections Support**:
   - एक ही API route में multiple collections query कर सकते हैं
   - सभी को common format में map करें
   - Merge करके return करें

### 5.3 Testing Steps

1. **Database Connection Test**:
   ```bash
   # Check MongoDB connection
   npm run dev
   # Logs में "✅ Connected to MongoDB" दिखना चाहिए
   ```

2. **Collection Access Test**:
   ```typescript
   // API route में add करें
   const collections = await connection.db.listCollections().toArray();
   console.log('Available collections:', collections.map(c => c.name));
   ```

3. **Query Test**:
   ```typescript
   // Check if data is being fetched
   const count = await collection.countDocuments();
   console.log(`Total shops: ${count}`);
   ```

4. **Frontend Test**:
   - Browser में `/api/shops/nearby` को directly call करें
   - Response में shops दिखने चाहिए
   - Frontend पर shops display होने चाहिए

---

## 6. Summary - Quick Reference

### Database Collections
- **`shops`**: Old shops (uses `name`, `phone`, GeoJSON `location`)
- **`agentshops`**: Agent shops (uses `shopName`, `mobile`, direct lat/lng)
- **`shopsfromimage`**: Admin shops (uses `shopName`, `mobile`)

### API Endpoints
- **`/api/shops/nearby`**: Main shop fetching (supports multiple collections)
- **`/api/admin/shops`**: Admin shop management
- **`/api/agent/shops`**: Agent shop management

### Frontend Components
- **`app/page.tsx`**: Homepage
- **`app/components/ShopSection.tsx`**: Shop listing
- **`app/components/BusinessesGrid.tsx`**: Main grid

### Context Providers
- **`LocationContext`**: User location
- **`SearchContext`**: Search filters
- **`AuthContext`**: Admin authentication

### Key Files
- **`lib/mongodb.ts`**: Database connection
- **`lib/models/*.ts`**: Database models
- **`app/api/*/route.ts`**: API routes

---

**Note**: यह documentation complete architecture explain करती है। कोई भी change करने से पहले backup लेना न भूलें!

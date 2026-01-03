# Fix Review Index Error

## Problem
Duplicate key error: `E11000 duplicate key error collection: 8rupiya.reviews index: shopId_1_userId_1`

This happens because multiple anonymous users (userId: null) try to review the same shop.

## Solution

### Option 1: Drop the old index (Recommended)
Run this in MongoDB shell or MongoDB Compass:

```javascript
// Connect to your database
use 8rupiya

// Drop the old unique index
db.reviews.dropIndex("shopId_1_userId_1")

// Create a sparse unique index (only enforces uniqueness when userId exists)
db.reviews.createIndex(
  { shopId: 1, userId: 1 }, 
  { unique: true, sparse: true, name: "shopId_1_userId_1" }
)
```

### Option 2: Remove unique constraint entirely
If you want to allow multiple reviews from the same user:

```javascript
use 8rupiya
db.reviews.dropIndex("shopId_1_userId_1")
```

## What this fixes:
- ✅ Anonymous users can now review the same shop multiple times
- ✅ Logged-in users can still only review once per shop (if sparse index is used)
- ✅ No more duplicate key errors


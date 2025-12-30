# Admin Panel Implementation Guide

## Overview
This guide provides the implementation approach for the complete enterprise-grade admin panel for 8rupiya.com.

## Completed Components

### 1. AdminLayout (✅ Complete)
- Located: `src/components/admin/AdminLayout.tsx`
- Features:
  - Full sidebar with all 15 sections
  - Mobile responsive
  - Dark/Light mode
  - User profile display
  - Logout functionality

### 2. AdminDashboard (✅ Complete)  
- Located: `src/components/admin/AdminDashboard.tsx`
- Features:
  - Key metrics cards
  - Commission overview
  - Revenue charts (6 months)
  - New shops chart (7 days)
  - Plan distribution chart
  - Pending shops table
  - Quick actions

## Implementation Pattern

### Page Structure
```typescript
// 1. Page Route (src/app/admin/[section]/page.tsx)
import AdminLayout from '@/components/admin/AdminLayout';
import SectionComponent from '@/components/admin/SectionComponent';

export default function AdminSectionPage() {
  return (
    <AdminLayout>
      <SectionComponent />
    </AdminLayout>
  );
}

// 2. Component (src/components/admin/SectionComponent.tsx)
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiIcon } from 'react-icons/fi';

export default function SectionComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    // Fetch from API
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Section Title</h1>
          <p className="text-gray-600">Description</p>
        </div>
        <button>Action</button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-4">
        {/* Filter inputs */}
      </div>

      {/* Table/Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Content */}
      </div>
    </div>
  );
}

// 3. API Route (src/app/api/admin/[section]/route.ts)
export async function GET(req: NextRequest) {
  // Verify admin
  // Fetch data  
  // Return JSON
}

export async function POST(req: NextRequest) {
  // Create/Update
}
```

## Remaining Pages to Implement

### 1. Shop Management ⏳ (In Progress)
**File**: `src/components/admin/ShopManagementPage.tsx`  
**Features**:
- List all shops with filters
- Approve/Reject buttons
- Featured tag toggle
- Homepage priority slider
- Status change dropdown
- Map view button
- Visitor count
- Plan expiry indicator

**API**: `/api/admin/shops`

### 2. User Management ⏳
**File**: `src/components/admin/UserManagementPage.tsx`  
**Features**:
- List all users with role filter
- Create user modal
- Edit user modal
- Block/Activate toggle
- Reset password button
- View shops button
- View earnings button

**API**: `/api/admin/users`

### 3. Payment Management ⏳
**File**: `src/components/admin/PaymentManagementPage.tsx`  
**Features**:
- List all payments
- Filter by status, mode, date
- View invoice button
- Refund button
- Link to shop
- Link to user
- Commission breakdown tooltip

**API**: `/api/admin/payments`

### 4. Commission Management ⏳
**File**: `src/components/admin/CommissionManagementPage.tsx`  
**Features**:
- Commission breakdown table
- Filter by agent/operator
- Pay agent button
- Pay operator button
- Status indicator
- Export report button
- Total commission summary

**API**: `/api/admin/commissions`

### 5. Plan Management ⏳
**File**: `src/components/admin/PlanManagementPage.tsx`  
**Features**:
- Plan cards grid
- Create plan modal
- Edit plan modal
- Toggle active status
- Drag to reorder priority
- Preview button

**API**: `/api/admin/plans`

### 6. Homepage Builder ⏳
**File**: `src/components/admin/HomepageBuilderPage.tsx`  
**Features**:
- Drag-and-drop blocks
- Block configuration panel
- Preview button
- Publish button
- Block templates
- Mobile preview

**API**: `/api/admin/homepage-blocks`

### 7. Advertisement Management ⏳
**File**: `src/components/admin/AdvertisementManagementPage.tsx`  
**Features**:
- Ad grid
- Upload banner modal
- Set position dropdown
- Click/impression stats
- Toggle active
- Preview button

**API**: `/api/admin/advertisements`

### 8. AI & Golu Analytics ⏳
**File**: `src/components/admin/AIAnalyticsPage.tsx`  
**Features**:
- Total interactions counter
- Top categories chart
- Top converting shops
- AI boost shop button
- Blocked users list
- Query logs table

**API**: `/api/admin/ai`

### 9. Jyotish Admin ⏳
**File**: `src/components/admin/JyotishAdminPage.tsx`  
**Features**:
- Pandit list
- Approve/Reject buttons
- Set plan dropdown
- Bookings table
- Earnings summary
- Block pandit button

**API**: `/api/admin/jyotish`

### 10. Reports ⏳
**File**: `src/components/admin/ReportsPage.tsx`  
**Features**:
- Report type selector
- Date range picker
- Format selector (PDF/Excel)
- Generate button
- Download button
- Report history

**API**: `/api/admin/reports`

### 11. Database Management ⏳
**File**: `src/components/admin/DatabasePage.tsx`  
**Features**:
- Collection selector
- Document browser
- Search bar
- Edit modal
- Delete confirmation
- Export collection

**API**: `/api/admin/database`

### 12. Settings ⏳
**File**: `src/components/admin/SettingsPage.tsx`  
**Features**:
- Site settings
- SEO settings
- Payment gateway config
- Email settings
- API keys
- Cache management

**API**: `/api/admin/settings`

## UI Components Library

Create reusable components in `src/components/admin/shared/`:

### 1. DataTable.tsx
```typescript
<DataTable
  columns={columns}
  data={data}
  onRowClick={handleRowClick}
  filters={filters}
  onFilterChange={handleFilterChange}
  pagination={pagination}
  loading={loading}
/>
```

### 2. StatCard.tsx
```typescript
<StatCard
  icon={FiIcon}
  title="Total Shops"
  value={stats.totalShops}
  change="+12%"
  trend="up"
  color="blue"
/>
```

### 3. FilterBar.tsx
```typescript
<FilterBar
  filters={[
    { type: 'select', name: 'city', options: cities },
    { type: 'search', name: 'query', placeholder: 'Search...' },
    { type: 'date', name: 'date', label: 'Date Range' }
  ]}
  onFilterChange={handleFilterChange}
/>
```

### 4. Modal.tsx
```typescript
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Create Shop"
  size="lg"
>
  {/* Modal content */}
</Modal>
```

### 5. ConfirmDialog.tsx
```typescript
<ConfirmDialog
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={onConfirm}
  title="Confirm Delete"
  message="Are you sure?"
  type="danger"
/>
```

## API Route Pattern

```typescript
// src/app/api/admin/[section]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Model from '@/models/Model';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/types/user';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                 req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Parse query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const filter = searchParams.get('filter') || '';

    // Build query
    const query: any = {};
    if (filter) {
      query.status = filter;
    }

    // Fetch data
    const total = await Model.countDocuments(query);
    const data = await Model.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Create/Update logic
}

export async function DELETE(req: NextRequest) {
  // Delete logic
}
```

## Styling Guide

### Color Palette
```css
/* Primary */
--purple-500: #a855f7
--purple-600: #9333ea
--purple-700: #7e22ce

/* Success */
--green-500: #10b981
--green-600: #059669

/* Warning */
--yellow-500: #f59e0b
--yellow-600: #d97706

/* Danger */
--red-500: #ef4444
--red-600: #dc2626

/* Neutral */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-900: #111827
```

### Component Styles

**Card**:
```tsx
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
  {/* Content */}
</div>
```

**Button Primary**:
```tsx
<button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
  Action
</button>
```

**Button Secondary**:
```tsx
<button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
  Action
</button>
```

**Input**:
```tsx
<input className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500" />
```

**Badge**:
```tsx
<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
  Active
</span>
```

## Animation Patterns

**Fade In**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

**Stagger Children**:
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.1 } }
  }}
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

## Security Checklist

- ✅ JWT token verification on all routes
- ✅ Role-based access control (ADMIN only)
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (use Mongoose)
- ✅ XSS prevention (use React's JSX escaping)
- ✅ CSRF protection (SameSite cookies)
- ✅ Rate limiting on API routes
- ✅ Audit logging for critical actions

## Testing Checklist

- [ ] Test all CRUD operations
- [ ] Test filters and search
- [ ] Test pagination
- [ ] Test mobile responsiveness
- [ ] Test dark mode
- [ ] Test with large datasets
- [ ] Test error handling
- [ ] Test loading states
- [ ] Test permissions
- [ ] Test export functionality

## Performance Optimization

1. **Database Indexes**: Ensure proper indexes on frequently queried fields
2. **Pagination**: Always paginate large datasets
3. **Caching**: Use Redis for frequently accessed data
4. **Lazy Loading**: Load data as needed
5. **Image Optimization**: Use Next.js Image component
6. **Code Splitting**: Dynamic imports for heavy components
7. **Debounce Search**: Prevent excessive API calls

## Next Steps

1. ✅ Complete AdminLayout with all sections
2. ✅ Complete AdminDashboard with charts
3. ⏳ Implement Shop Management page
4. ⏳ Implement User Management page
5. ⏳ Implement Commission Management page
6. ⏳ Implement remaining pages following the pattern

## Resources

- **Icons**: react-icons/fi
- **Charts**: recharts
- **Animations**: framer-motion
- **Forms**: react-hook-form (optional)
- **Tables**: @tanstack/react-table (optional)
- **Date Picker**: react-datepicker (optional)

---

**Note**: This is a comprehensive guide. Follow the patterns and replicate for all sections. Each page should be self-contained, reusable, and follow the same structure.




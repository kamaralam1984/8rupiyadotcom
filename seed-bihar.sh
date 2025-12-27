#!/bin/bash
echo "🌱 Seeding Bihar shops to database..."
echo ""
echo "Step 1: Initializing plans (if not exists)..."
curl -X POST http://localhost:3000/api/admin/plans/init \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  2>/dev/null || echo "Plans may already exist or need authentication"

echo ""
echo "Step 2: Adding shops from all Bihar districts..."
curl -X POST http://localhost:3000/api/admin/seed-bihar-shops \
  -H "Content-Type: application/json" \
  2>/dev/null

echo ""
echo "✅ Done! Check your database."

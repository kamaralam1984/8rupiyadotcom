#!/bin/bash

# Admin User Creation Script
# This script creates an admin user using the API endpoint

echo "🔐 Creating Admin User..."
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Server is not running on http://localhost:3000"
    echo "   Please start the server first: npm run dev"
    exit 1
fi

# Create admin using API
RESPONSE=$(curl -s -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{}')

# Check if admin was created
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Admin user created successfully!"
    echo ""
    echo "📋 Login Credentials:"
    echo "$RESPONSE" | grep -o '"email":"[^"]*"' | sed 's/"email":"\(.*\)"/   Email: \1/'
    echo "$RESPONSE" | grep -o '"password":"[^"]*"' | sed 's/"password":"\(.*\)"/   Password: \1/'
    echo ""
    echo "⚠️  Please change the password after first login!"
else
    # Check if admin already exists
    if echo "$RESPONSE" | grep -q "already exists"; then
        echo "⚠️  Admin user already exists!"
        echo ""
        echo "$RESPONSE" | grep -o '"email":"[^"]*"' | sed 's/"email":"\(.*\)"/   Email: \1/'
        echo ""
        echo "💡 To reset password, run:"
        echo "   curl -X POST http://localhost:3000/api/admin/init -H 'Content-Type: application/json' -d '{\"reset\":true}'"
    else
        echo "❌ Error creating admin:"
        echo "$RESPONSE"
    fi
fi


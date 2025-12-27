# Admin User Setup Guide

## Quick Setup (सबसे आसान तरीका)

### Method 1: NPM Script (Recommended - सबसे आसान)

```bash
# Default admin बनाएं
npm run create-admin
```

**Default Credentials:**
- Email: `admin@8rupiya.com`
- Password: `admin123`
- Phone: `9999999999`

**Custom Admin बनाएं:**
```bash
node create-admin-direct.js --name "Your Name" --email "your@email.com" --password "yourpassword" --phone "9876543210"
```

**Reset Admin (अगर already exists):**
```bash
npm run create-admin:reset
```

या:
```bash
node create-admin-direct.js --reset
```

### Method 2: API Endpoint (Server चल रहा होने पर)

Server चल रहा होने पर:

```bash
# Admin बनाएं
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{}'
```

या browser में Postman/Thunder Client से:
- URL: `http://localhost:3000/api/admin/init`
- Method: `POST`
- Body: `{}`

**Default Credentials:**
- Email: `admin@8rupiya.com`
- Password: `admin123`

### Method 3: Custom Admin via API

अगर custom email/password चाहिए:

```bash
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Name",
    "email": "your-email@example.com",
    "phone": "9999999999",
    "password": "your-password",
    "role": "admin"
  }'
```

## Reset Admin Password

अगर admin already exists है और password reset करना है:

```bash
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"reset": true}'
```

यह existing admin को delete करके नया admin बनाएगा।

## Login करें

1. Browser में जाएं: `http://localhost:3000/login`
2. Email: `admin@8rupiya.com`
3. Password: `admin123`
4. Login करें
5. **Important:** First login के बाद password change करें!

## Troubleshooting

### Admin already exists?
```bash
# Reset करें
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"reset": true}'
```

### Server not running?
```bash
npm run dev
```

### MongoDB connection error?
- Check `.env.local` में `MONGODB_URI` है
- MongoDB server चल रहा है

## Security Note

⚠️ **Important:**
- Production में default password use न करें
- First login के बाद password change करें
- Strong password use करें (minimum 8 characters, mixed case, numbers)


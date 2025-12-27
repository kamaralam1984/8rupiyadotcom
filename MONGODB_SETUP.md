# MongoDB Setup Guide

## Common MongoDB URI Formats

### 1. Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/8rupiya
```

### 2. MongoDB Atlas (Cloud) - Standard Format
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### 3. MongoDB Atlas - With Options
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/8rupiya?retryWrites=true&w=majority
```

## ⚠️ Important Notes

### ❌ WRONG - Don't use port with mongodb+srv
```env
# This will cause an error:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net:27017/8rupiya
```

### ✅ CORRECT - No port with mongodb+srv
```env
# This is correct:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/8rupiya
```

## Setup Steps

### Option 1: Local MongoDB

1. **Install MongoDB locally:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

2. **Set in .env.local:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/8rupiya
   ```

### Option 2: MongoDB Atlas (Recommended for Production)

1. **Create account:** Go to https://www.mongodb.com/cloud/atlas

2. **Create a cluster** (Free tier available)

3. **Create database user:**
   - Go to Database Access
   - Add new user
   - Set username and password

4. **Whitelist IP:**
   - Go to Network Access
   - Add IP: `0.0.0.0/0` (for development) or your specific IP

5. **Get connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

6. **Set in .env.local:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/8rupiya?retryWrites=true&w=majority
   ```
   
   **Replace:**
   - `username` with your database username
   - `password` with your database password
   - `cluster` with your cluster name
   - `8rupiya` with your database name

## Example .env.local

```env
# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/8rupiya

# OR for MongoDB Atlas
# MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/8rupiya?retryWrites=true&w=majority

REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

## Troubleshooting

### Error: "mongodb+srv URI cannot have port number"
- **Solution:** Remove any port number from your `mongodb+srv://` URI
- Check your `.env.local` file
- Make sure there's no `:27017` or other port in the URI

### Error: "Authentication failed"
- Check your username and password in the URI
- Make sure special characters in password are URL-encoded
- Verify database user has correct permissions

### Error: "Connection timeout"
- Check your IP is whitelisted in MongoDB Atlas
- Verify network connectivity
- Check firewall settings

### Error: "Database not found"
- The database will be created automatically on first connection
- Make sure the database name in URI is correct

## Testing Connection

After setting up, test the connection:

```bash
npm run dev
```

Then try to register a user. If MongoDB is connected, you should see:
```
✅ MongoDB connected successfully
```

If there's an error, check the console for detailed error messages.


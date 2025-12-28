# Email OTP Setup Guide

## Gmail Setup (Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security"
3. Enable "2-Step Verification"

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "8rupiya OTP" as the name
4. Click "Generate"
5. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Add to .env.local
Add these lines to your `.env.local` file:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

**Alternative variable names** (also supported):
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

**Important**: 
- Remove spaces from the app password when adding to .env.local
- You can use either `SMTP_USER`/`SMTP_PASS` or `EMAIL_USER`/`EMAIL_PASSWORD` (both work)

### Step 4: Restart Server
After adding credentials, restart your Next.js server:
```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

## Alternative: Custom SMTP (Production)

For production, you can use services like:
- SendGrid
- AWS SES
- Mailgun
- SMTP2GO

Add to `.env.local`:
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

## Testing Email

After setup, test by:
1. Go to `/register` page
2. Fill the form and click "Send OTP"
3. Check your email inbox
4. Also check spam folder if not found

## Troubleshooting

### OTP not received?
1. Check server console for errors
2. Verify SMTP credentials are correct (check `.env.local` file)
3. Check spam folder
4. For Gmail: Must use App Password (regular password won't work)
5. Check firewall/network restrictions
6. Make sure you restarted the server after adding credentials

### Common Errors:
- **"Invalid login" / "EAUTH"**: Wrong password or need App Password (not regular Gmail password)
- **"Connection timeout" / "ETIMEDOUT"**: Firewall blocking SMTP port or network issue
- **"Authentication failed"**: Need to enable 2FA and use App Password (not regular password)
- **"ECONNECTION"**: Check SMTP_HOST and SMTP_PORT if using custom SMTP

### Environment Variables Reference

The application supports these environment variables:

**For Gmail (simplest):**
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Alternative names (also work):**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**For Custom SMTP (production):**
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

**Note:** If both `SMTP_HOST` and `SMTP_USER` are set, custom SMTP will be used. Otherwise, Gmail service will be used.


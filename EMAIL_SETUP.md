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

**Important**: Remove spaces from the app password when adding to .env.local

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
2. Verify SMTP credentials are correct
3. Check spam folder
4. For Gmail: Make sure "Less secure app access" is enabled OR use App Password
5. Check firewall/network restrictions

### Common Errors:
- **"Invalid login"**: Wrong password or need App Password
- **"Connection timeout"**: Firewall blocking SMTP port
- **"Authentication failed"**: Need to enable 2FA and use App Password


import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  // For development, use Gmail SMTP or any SMTP service
  // For production, use proper SMTP service like SendGrid, AWS SES, etc.
  
  // If SMTP config is provided, use it
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Gmail
  if (process.env.SMTP_USER || process.env.EMAIL_USER) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Return null if no email config (will use console log in dev)
  return null;
};

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // Always log OTP in development mode (for testing)
    console.log('\n📧 ============================================');
    console.log('📧 OTP Email');
    console.log('📧 ============================================');
    console.log(`📧 To: ${email}`);
    console.log(`📧 OTP: ${otp}`);
    
    // If no email credentials, just log and return true (for development)
    if (!transporter) {
      console.log('⚠️  ============================================');
      console.log('⚠️  EMAIL NOT SENT - SMTP NOT CONFIGURED!');
      console.log('⚠️  ============================================');
      console.log('⚠️  OTP logged above for testing only.');
      console.log('');
      console.log('📝 TO SEND ACTUAL EMAILS:');
      console.log('   1. Open .env.local file in project root');
      console.log('   2. Add these two lines:');
      console.log('      SMTP_USER=your-email@gmail.com');
      console.log('      SMTP_PASS=your-gmail-app-password');
      console.log('   3. Save the file');
      console.log('   4. Restart the server (Ctrl+C then npm run dev)');
      console.log('');
      console.log('📖 For Gmail App Password setup:');
      console.log('   - Go to: https://myaccount.google.com/apppasswords');
      console.log('   - Generate App Password for "Mail"');
      console.log('   - Copy 16-character password (remove spaces)');
      console.log('   - See EMAIL_SETUP.md for detailed steps');
      console.log('⚠️  ============================================\n');
      return true; // Return true in dev mode
    }
    
    console.log('📧 Attempting to send email via SMTP...');

    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@8rupiya.com',
      to: email,
      subject: '8rupiya.com - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">8rupiya.com</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Email Verification</h2>
            <p style="color: #4b5563; font-size: 16px;">Your OTP for email verification is:</p>
            <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</h1>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This OTP will expire in 10 minutes.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">If you didn't request this OTP, please ignore this email.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2024 8rupiya.com. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   To:', email);
    console.log('📧 ============================================\n');
    return true;
  } catch (error: any) {
    console.error('\n❌ ============================================');
    console.error('❌ Error sending email!');
    console.error('❌ ============================================');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'EAUTH') {
      console.error('❌ Authentication failed!');
      console.error('   - Check if SMTP_USER and SMTP_PASS are correct');
      console.error('   - For Gmail: Use App Password (not regular password)');
      console.error('   - See EMAIL_SETUP.md for Gmail App Password setup');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      console.error('❌ Connection failed!');
      console.error('   - Check your internet connection');
      console.error('   - Check if SMTP_HOST and SMTP_PORT are correct');
      console.error('   - Check firewall settings');
    } else {
      console.error('❌ Unknown error:', error);
    }
    
    console.error('\n📧 OTP (Fallback - Email failed):', otp);
    console.error('⚠️  Email not sent, but OTP is logged above for testing');
    console.error('📖 See EMAIL_SETUP.md for email setup instructions');
    console.error('❌ ============================================\n');
    
    // In development, still return true if email fails (but log the error)
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }
}


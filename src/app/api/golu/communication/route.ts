import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Communication Control API (SMS, Email, WhatsApp)
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { type, recipient, message, subject } = await req.json();

    // Send SMS via Twilio
    if (type === 'SMS') {
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

      if (!twilioSid || !twilioToken || !twilioPhone) {
        return NextResponse.json({
          success: false,
          message: 'Twilio not configured',
        });
      }

      try {
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: recipient,
              From: twilioPhone,
              Body: message,
            }),
          }
        );

        const data = await response.json();

        return NextResponse.json({
          success: true,
          message: 'SMS sent successfully',
          data,
        });
      } catch (error: any) {
        console.error('SMS error:', error);
        return NextResponse.json({
          success: false,
          error: error.message,
        });
      }
    }

    // Send WhatsApp via Twilio
    if (type === 'WHATSAPP') {
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;

      if (!twilioSid || !twilioToken || !twilioWhatsApp) {
        return NextResponse.json({
          success: false,
          message: 'Twilio WhatsApp not configured',
        });
      }

      try {
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: `whatsapp:${recipient}`,
              From: twilioWhatsApp,
              Body: message,
            }),
          }
        );

        const data = await response.json();

        return NextResponse.json({
          success: true,
          message: 'WhatsApp message sent',
          data,
        });
      } catch (error: any) {
        console.error('WhatsApp error:', error);
        return NextResponse.json({
          success: false,
          error: error.message,
        });
      }
    }

    // Send Email via SendGrid
    if (type === 'EMAIL') {
      const sendgridKey = process.env.SENDGRID_API_KEY;
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@8rupiya.com';

      if (!sendgridKey) {
        return NextResponse.json({
          success: false,
          message: 'SendGrid not configured',
        });
      }

      try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendgridKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: recipient }],
              subject: subject || 'Message from 8rupiya GOLU',
            }],
            from: { email: fromEmail },
            content: [{
              type: 'text/plain',
              value: message,
            }],
          }),
        });

        if (response.ok) {
          return NextResponse.json({
            success: true,
            message: 'Email sent successfully',
          });
        } else {
          const error = await response.text();
          throw new Error(error);
        }
      } catch (error: any) {
        console.error('Email error:', error);
        return NextResponse.json({
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      error: 'Invalid communication type',
    }, { status: 400 });
  } catch (error: any) {
    console.error('Communication error:', error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}


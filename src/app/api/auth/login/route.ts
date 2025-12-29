import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, generateToken } from '@/lib/auth';
import { syncUserCommissions } from '@/lib/commission-sync';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.error('Login failed: User not found for email:', normalizedEmail);
      // Check if admin exists
      if (normalizedEmail.includes('admin')) {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
          return NextResponse.json({ 
            error: 'Invalid credentials',
            hint: 'Admin user does not exist. Please create admin user first.'
          }, { status: 401 });
        }
      }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('User found:', { id: user._id, email: user.email, role: user.role, isActive: user.isActive });
    
    const isValid = await comparePassword(password, user.password);
    console.log('Password comparison result:', isValid);
    
    if (!isValid) {
      console.error('Login failed: Invalid password for email:', normalizedEmail);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
    }

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    // Sync commissions in background (don't wait for it to complete)
    // This ensures all commissions are calculated and linked properly
    syncUserCommissions(user._id.toString(), user.role).catch(err => {
      console.error('Error syncing commissions on login:', err);
      // Don't fail login if commission sync fails
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


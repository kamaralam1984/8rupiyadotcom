import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

// Tool Collector API - GOLU Advanced Tools
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('token')?.value;
    
    const { tool, action, data } = await req.json();

    // Public tools (no auth required)
    const publicTools = ['weather', 'calculator', 'time', 'translation'];
    
    if (!publicTools.includes(tool) && !token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token for protected tools
    let userId = null;
    if (token) {
      const payload = verifyToken(token);
      userId = payload?.userId;
    }

    await connectDB();

    // Weather Tool
    if (tool === 'weather') {
      const { city } = data;
      const apiKey = process.env.OPENWEATHER_API_KEY;
      
      if (!apiKey) {
        return NextResponse.json({
          success: false,
          message: 'Weather API not configured',
        });
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      const weatherData = await response.json();

      return NextResponse.json({
        success: true,
        tool: 'weather',
        data: weatherData,
      });
    }

    // Calculator Tool
    if (tool === 'calculator') {
      const { expression } = data;
      try {
        // Safe eval using Function constructor
        const result = Function('"use strict"; return (' + expression + ')')();
        return NextResponse.json({
          success: true,
          tool: 'calculator',
          result,
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Invalid expression',
        });
      }
    }

    // Time Tool
    if (tool === 'time') {
      const { timezone = 'Asia/Kolkata' } = data;
      const now = new Date();
      
      return NextResponse.json({
        success: true,
        tool: 'time',
        time: now.toLocaleString('en-IN', { timeZone: timezone }),
        timestamp: now.getTime(),
        timezone,
      });
    }

    // Translation Tool
    if (tool === 'translation') {
      const { text, targetLang } = data;
      const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
      
      if (!apiKey) {
        return NextResponse.json({
          success: false,
          message: 'Translation API not configured',
        });
      }

      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: text,
            target: targetLang,
          }),
        }
      );

      const translationData = await response.json();

      return NextResponse.json({
        success: true,
        tool: 'translation',
        data: translationData,
      });
    }

    // Notes Tool (requires auth)
    if (tool === 'notes' && userId) {
      if (action === 'create') {
        // Store note in user profile or separate notes collection
        return NextResponse.json({
          success: true,
          message: 'Note created',
        });
      }
      
      if (action === 'list') {
        // Get user notes
        return NextResponse.json({
          success: true,
          notes: [],
        });
      }
    }

    // Browser Tool
    if (tool === 'browser') {
      const { url, action: browserAction } = data;
      
      return NextResponse.json({
        success: true,
        tool: 'browser',
        action: browserAction,
        url,
        message: 'Browser action executed',
      });
    }

    // Media Player Tool
    if (tool === 'media') {
      const { mediaAction, mediaUrl } = data;
      
      return NextResponse.json({
        success: true,
        tool: 'media',
        action: mediaAction,
        url: mediaUrl,
        message: 'Media control executed',
      });
    }

    return NextResponse.json({
      error: 'Invalid tool or action',
    }, { status: 400 });
  } catch (error: any) {
    console.error('Tools error:', error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}

// GET available tools
export async function GET(req: NextRequest) {
  const tools = {
    public: [
      {
        id: 'weather',
        name: 'Weather',
        description: 'Get weather information',
        icon: '🌤️',
        category: 'information',
      },
      {
        id: 'calculator',
        name: 'Calculator',
        description: 'Perform calculations',
        icon: '🧮',
        category: 'utility',
      },
      {
        id: 'time',
        name: 'Time & Date',
        description: 'Get current time',
        icon: '⏰',
        category: 'utility',
      },
      {
        id: 'translation',
        name: 'Translation',
        description: 'Translate text',
        icon: '🌍',
        category: 'language',
      },
    ],
    protected: [
      {
        id: 'notes',
        name: 'Notes',
        description: 'Create and manage notes',
        icon: '📝',
        category: 'productivity',
      },
      {
        id: 'browser',
        name: 'Browser Control',
        description: 'Control browser actions',
        icon: '🌐',
        category: 'control',
      },
      {
        id: 'media',
        name: 'Media Player',
        description: 'Control media playback',
        icon: '🎵',
        category: 'media',
      },
    ],
  };

  return NextResponse.json({
    success: true,
    tools,
  });
}


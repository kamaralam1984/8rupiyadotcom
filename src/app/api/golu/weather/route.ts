import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Weather and alerts
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { city } = body;

    if (!city) {
      return NextResponse.json({ error: 'City required' }, { status: 400 });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        weather: {
          city,
          temperature: 'N/A',
          condition: 'API key not configured',
          humidity: 'N/A',
          alerts: [],
        },
        message: 'OpenWeather API key not configured. Please add OPENWEATHER_API_KEY to .env.local',
      });
    }

    // Get weather data from OpenWeather API
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;

    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    if (weatherData.cod !== 200) {
      return NextResponse.json({
        error: 'Could not fetch weather data',
        details: weatherData.message,
      }, { status: 400 });
    }

    // Get alerts if available
    const lat = weatherData.coord.lat;
    const lon = weatherData.coord.lon;
    
    const alertsUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    
    let alerts: any[] = [];
    try {
      const alertsResponse = await fetch(alertsUrl);
      const alertsData = await alertsResponse.json();
      alerts = alertsData.alerts || [];
    } catch (error) {
      console.log('Could not fetch alerts:', error);
    }

    // Format weather data
    const weather = {
      city: weatherData.name,
      temperature: `${Math.round(weatherData.main.temp)}°C`,
      feelsLike: `${Math.round(weatherData.main.feels_like)}°C`,
      condition: weatherData.weather[0].description,
      humidity: `${weatherData.main.humidity}%`,
      windSpeed: `${weatherData.wind.speed} m/s`,
      visibility: `${weatherData.visibility / 1000} km`,
      alerts: alerts.map((alert: any) => ({
        event: alert.event,
        description: alert.description,
        start: new Date(alert.start * 1000),
        end: new Date(alert.end * 1000),
      })),
    };

    // Generate smart suggestions
    const suggestions = [];
    
    if (weatherData.main.temp > 35) {
      suggestions.push('🌡️ Bahut garmi hai, AC on rakhe aur paani peete rahe');
    } else if (weatherData.main.temp < 15) {
      suggestions.push('🧥 Thand hai, garm kapde pehen ke nikle');
    }

    if (weatherData.weather[0].main === 'Rain') {
      suggestions.push('☔ Baarish ho rahi hai, umbrella le jana na bhule');
    }

    if (weatherData.main.humidity > 80) {
      suggestions.push('💧 Humidity bahut zyada hai, halke kapde pehne');
    }

    return NextResponse.json({
      success: true,
      weather,
      suggestions,
    });
  } catch (error) {
    console.error('Error in weather API:', error);
    return NextResponse.json(
      { error: 'Failed to get weather information' },
      { status: 500 }
    );
  }
}


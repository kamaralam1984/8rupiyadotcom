import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';

// Astrology and Jyotish predictions
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

    await connectDB();

    const body = await req.json();
    const { query, type = 'daily' } = body;

    // Get user profile for personalized predictions
    const profile = await UserProfile.findOne({ userId: decoded.userId });

    // Get current date info
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0-6
    const dateNum = today.getDate();
    const month = today.getMonth() + 1;

    // Lucky colors based on day
    const luckyColors = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'White'];
    const todaysColor = luckyColors[dayOfWeek];

    // Lucky numbers based on date
    const luckyNumber1 = (dateNum % 9) + 1;
    const luckyNumber2 = ((dateNum * 2) % 9) + 1;

    // Generate predictions based on day
    const predictions = generateDailyPrediction(dayOfWeek, dateNum);

    // Business advice
    const businessAdvice = generateBusinessAdvice(dayOfWeek, dateNum);

    // Health tips
    const healthTips = generateHealthTips(dayOfWeek);

    // Financial advice
    const financialAdvice = generateFinancialAdvice(dayOfWeek, dateNum);

    const response: any = {
      success: true,
      date: today.toLocaleDateString('hi-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      lucky: {
        color: todaysColor,
        numbers: [luckyNumber1, luckyNumber2],
        time: predictions.luckyTime,
        direction: predictions.luckyDirection,
      },
      predictions: {
        general: predictions.general,
        career: predictions.career,
        love: predictions.love,
        health: healthTips,
      },
      advice: {
        business: businessAdvice,
        financial: financialAdvice,
        doThis: predictions.doThis,
        avoidThis: predictions.avoidThis,
      },
    };

    // Personalized message
    const userName = profile?.nickName || profile?.fullName || 'Kamar ji';
    response.message = `${userName}, aaj aapke liye ${todaysColor} color lucky hai. ${predictions.summary}`;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in astrology API:', error);
    return NextResponse.json(
      { error: 'Failed to get astrology prediction' },
      { status: 500 }
    );
  }
}

// Helper functions for predictions
function generateDailyPrediction(dayOfWeek: number, date: number) {
  const predictions = [
    {
      // Sunday
      general: 'Aaj ka din aapke liye achha rahega. New opportunities mil sakti hain.',
      career: 'Office me senior ka support milega. Naye project me achhe results.',
      love: 'Partner ke saath time spend kare. Understanding badhegi.',
      luckyTime: '10:00 AM - 12:00 PM',
      luckyDirection: 'East',
      doThis: ['Mandir jaye', 'Red kapde pehne', 'Charity kare'],
      avoidThis: ['Ladai-jhagda', 'Bade investment', 'Travel avoid kare'],
      summary: 'Din spiritual activities ke liye perfect hai.',
    },
    {
      // Monday
      general: 'Aaj shanti aur peace ka din hai. Mind calm rakhe.',
      career: 'Kaam me thoda slow progress, par steady rahega.',
      love: 'Emotional connection strong hoga. Acchi baat-cheet hogi.',
      luckyTime: '6:00 PM - 8:00 PM',
      luckyDirection: 'North-West',
      doThis: ['White kapde pehne', 'Meditation kare', 'Family time'],
      avoidThis: ['Gussa karna', 'Risky decisions', 'Late night bahar jana'],
      summary: 'Aaj ka din family aur peace ke liye achha hai.',
    },
    {
      // Tuesday
      general: 'Energy level high rahega. Tasks complete karne ka achha din.',
      career: 'Boss se appreciation mil sakti hai. Targets achieve honge.',
      love: 'Thoda patience rakhe. Small misunderstandings ho sakti hain.',
      luckyTime: '9:00 AM - 11:00 AM',
      luckyDirection: 'South',
      doThis: ['Red color pehne', 'Gym jaye', 'Important meetings rakhe'],
      avoidThis: ['Over-confidence', 'Argument', 'Junk food'],
      summary: 'Din productive rahega, energy ka sahi use kare.',
    },
    {
      // Wednesday
      general: 'Communication aur networking ka perfect din hai.',
      career: 'New connections ban sakti hain. Collaborations achhe rahenge.',
      love: 'Partner ko surprise de. Romantic din ho sakta hai.',
      luckyTime: '2:00 PM - 4:00 PM',
      luckyDirection: 'North',
      doThis: ['Green kapde', 'Social media active rahe', 'Friends se mile'],
      avoidThis: ['Secrets batana', 'Money lending', 'Negative people'],
      summary: 'Communication skills ka bharosa rakhe.',
    },
    {
      // Thursday
      general: 'Luck aapka saath degi. Important decisions le sakte hain.',
      career: 'Promotion ya salary hike ki khabar aa sakti hai.',
      love: 'Long term commitments ke baare me soch sakte hain.',
      luckyTime: '11:00 AM - 1:00 PM',
      luckyDirection: 'North-East',
      doThis: ['Yellow color', 'Guru ka aashirwad le', 'Study/Learning'],
      avoidThis: ['Fake promises', 'Ego', 'Over-spending'],
      summary: 'Aaj ka din growth aur wisdom ke liye best hai.',
    },
    {
      // Friday
      general: 'Beauty, art aur creativity ka din. Enjoy kare.',
      career: 'Creative projects me success milegi. Recognition possible.',
      love: 'Romance peak pe hoga. Partner ke saath quality time.',
      luckyTime: '5:00 PM - 7:00 PM',
      luckyDirection: 'South-East',
      doThis: ['White/Pink kapde', 'Shopping', 'Beauty/Grooming'],
      avoidThis: ['Over-indulgence', 'Laziness', 'Procrastination'],
      summary: 'Din enjoy kare par balanced rahe.',
    },
    {
      // Saturday
      general: 'Hard work ka din. Mehnat ka phal milega.',
      career: 'Difficult tasks complete kare. Long term planning kare.',
      love: 'Serious conversations ho sakti hain. Honesty important.',
      luckyTime: '7:00 AM - 9:00 AM',
      luckyDirection: 'West',
      doThis: ['Black/Blue kapde', 'Discipline rakhe', 'Planning'],
      avoidThis: ['Shortcuts', 'Cheating', 'Negative thoughts'],
      summary: 'Mehnat aur dedication se sab possible hai.',
    },
  ];

  return predictions[dayOfWeek];
}

function generateBusinessAdvice(dayOfWeek: number, date: number) {
  const isLucky = date % 3 === 0;
  
  if (isLucky) {
    return 'Aaj business decisions lene ke liye achha din hai. New ventures start kar sakte hain.';
  } else if (date % 2 === 0) {
    return 'Existing business pe focus kare. Expansion abhi avoid kare.';
  } else {
    return 'Aaj customers se baat-cheet achhi rahegi. Marketing par dhyan de.';
  }
}

function generateFinancialAdvice(dayOfWeek: number, date: number) {
  if (dayOfWeek === 0 || dayOfWeek === 4) {
    // Sunday or Thursday - Lucky for money
    return 'Investment ke liye achha din hai. Calculated risk le sakte hain.';
  } else if (dayOfWeek === 2 || dayOfWeek === 6) {
    // Tuesday or Saturday - Be careful
    return 'Aaj bade investment avoid kare. Savings par focus rakhe.';
  } else {
    return 'Normal spending kare. Unnecessary expenses avoid kare.';
  }
}

function generateHealthTips(dayOfWeek: number) {
  const tips = [
    'Yoga aur meditation kare. Mantra jaap se peace milegi.',
    'Paani zyada piye. Calm mind rakhe. White color beneficial.',
    'Exercise kare. Energy high hai, iska use kare.',
    'Healthy diet le. Green vegetables zyada khaye.',
    'Balanced diet rakhe. Vitamins ka dhyan rakhe.',
    'Self-care kare. Beauty aur health dono important.',
    'Proper rest le. Over-work na kare. Sleep 7-8 hours.',
  ];

  return tips[dayOfWeek];
}


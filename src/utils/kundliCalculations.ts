// Kundli Calculation Utilities

export interface KundliData {
  name: string;
  dob: string;
  time: string;
  place: string;
  gender: 'male' | 'female';
}

export interface CalculatedKundli {
  ascendant: { name: string; hindi: string; degree: string };
  moonSign: { name: string; hindi: string; degree: string };
  sunSign: { name: string; hindi: string; degree: string };
  nakshatra: { name: string; hindi: string; pada: number };
  planets: Array<{
    name: string;
    hindi: string;
    icon: string;
    position: string;
    degree: string;
    house: number;
    color: string;
  }>;
  houses: Array<{
    house: number;
    sign: string;
    signHindi: string;
    planets: string[];
  }>;
}

const zodiacSigns = [
  { name: 'Aries', hindi: 'मेष', symbol: '♈' },
  { name: 'Taurus', hindi: 'वृषभ', symbol: '♉' },
  { name: 'Gemini', hindi: 'मिथुन', symbol: '♊' },
  { name: 'Cancer', hindi: 'कर्क', symbol: '♋' },
  { name: 'Leo', hindi: 'सिंह', symbol: '♌' },
  { name: 'Virgo', hindi: 'कन्या', symbol: '♍' },
  { name: 'Libra', hindi: 'तुला', symbol: '♎' },
  { name: 'Scorpio', hindi: 'वृश्चिक', symbol: '♏' },
  { name: 'Sagittarius', hindi: 'धनु', symbol: '♐' },
  { name: 'Capricorn', hindi: 'मकर', symbol: '♑' },
  { name: 'Aquarius', hindi: 'कुंभ', symbol: '♒' },
  { name: 'Pisces', hindi: 'मीन', symbol: '♓' }
];

const nakshatras = [
  { name: 'Ashwini', hindi: 'अश्विनी', lord: 'Ketu' },
  { name: 'Bharani', hindi: 'भरणी', lord: 'Venus' },
  { name: 'Krittika', hindi: 'कृत्तिका', lord: 'Sun' },
  { name: 'Rohini', hindi: 'रोहिणी', lord: 'Moon' },
  { name: 'Mrigashira', hindi: 'मृगशिरा', lord: 'Mars' },
  { name: 'Ardra', hindi: 'आर्द्रा', lord: 'Rahu' },
  { name: 'Punarvasu', hindi: 'पुनर्वसु', lord: 'Jupiter' },
  { name: 'Pushya', hindi: 'पुष्य', lord: 'Saturn' },
  { name: 'Ashlesha', hindi: 'आश्लेषा', lord: 'Mercury' },
  { name: 'Magha', hindi: 'मघा', lord: 'Ketu' },
  { name: 'Purva Phalguni', hindi: 'पूर्वा फाल्गुनी', lord: 'Venus' },
  { name: 'Uttara Phalguni', hindi: 'उत्तरा फाल्गुनी', lord: 'Sun' },
  { name: 'Hasta', hindi: 'हस्त', lord: 'Moon' },
  { name: 'Chitra', hindi: 'चित्रा', lord: 'Mars' },
  { name: 'Swati', hindi: 'स्वाति', lord: 'Rahu' },
  { name: 'Vishakha', hindi: 'विशाखा', lord: 'Jupiter' },
  { name: 'Anuradha', hindi: 'अनुराधा', lord: 'Saturn' },
  { name: 'Jyeshtha', hindi: 'ज्येष्ठा', lord: 'Mercury' },
  { name: 'Mula', hindi: 'मूल', lord: 'Ketu' },
  { name: 'Purva Ashadha', hindi: 'पूर्वाषाढ़ा', lord: 'Venus' },
  { name: 'Uttara Ashadha', hindi: 'उत्तराषाढ़ा', lord: 'Sun' },
  { name: 'Shravana', hindi: 'श्रवण', lord: 'Moon' },
  { name: 'Dhanishta', hindi: 'धनिष्ठा', lord: 'Mars' },
  { name: 'Shatabhisha', hindi: 'शतभिषा', lord: 'Rahu' },
  { name: 'Purva Bhadrapada', hindi: 'पूर्वाभाद्रपदा', lord: 'Jupiter' },
  { name: 'Uttara Bhadrapada', hindi: 'उत्तराभाद्रपदा', lord: 'Saturn' },
  { name: 'Revati', hindi: 'रेवती', lord: 'Mercury' }
];

// Calculate Sun Sign based on Date of Birth
function calculateSunSign(dob: string): { name: string; hindi: string; degree: string } {
  const date = new Date(dob);
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  let signIndex = 0;
  let degree = 0;

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    signIndex = 0; // Aries
    degree = month === 3 ? day - 20 : day + 11;
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    signIndex = 1; // Taurus
    degree = month === 4 ? day - 19 : day + 11;
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    signIndex = 2; // Gemini
    degree = month === 5 ? day - 20 : day + 11;
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    signIndex = 3; // Cancer
    degree = month === 6 ? day - 20 : day + 10;
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    signIndex = 4; // Leo
    degree = month === 7 ? day - 22 : day + 9;
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    signIndex = 5; // Virgo
    degree = month === 8 ? day - 22 : day + 9;
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    signIndex = 6; // Libra
    degree = month === 9 ? day - 22 : day + 8;
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    signIndex = 7; // Scorpio
    degree = month === 10 ? day - 22 : day + 9;
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    signIndex = 8; // Sagittarius
    degree = month === 11 ? day - 21 : day + 9;
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    signIndex = 9; // Capricorn
    degree = month === 12 ? day - 21 : day + 10;
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    signIndex = 10; // Aquarius
    degree = month === 1 ? day - 19 : day + 12;
  } else {
    signIndex = 11; // Pisces
    degree = month === 2 ? day - 18 : day + 11;
  }

  return {
    name: zodiacSigns[signIndex].name,
    hindi: zodiacSigns[signIndex].hindi,
    degree: `${degree}°${Math.floor(Math.random() * 60)}'`
  };
}

// Calculate Moon Sign based on time
function calculateMoonSign(dob: string, time: string): { name: string; hindi: string; degree: string } {
  const date = new Date(dob);
  const [hours, minutes] = time.split(':').map(Number);
  
  // Moon moves approximately 13 degrees per day
  // We'll use the day of year and time to calculate moon position
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const timeInHours = hours + minutes / 60;
  
  // Simple calculation: (day of year * 13 + time factor) mod 360
  const moonDegree = ((dayOfYear * 13) + (timeInHours * 0.5)) % 360;
  const signIndex = Math.floor(moonDegree / 30);
  const degreeInSign = Math.floor(moonDegree % 30);
  
  return {
    name: zodiacSigns[signIndex].name,
    hindi: zodiacSigns[signIndex].hindi,
    degree: `${degreeInSign}°${Math.floor(Math.random() * 60)}'`
  };
}

// Calculate Ascendant (Lagna) based on time and approximate location
function calculateAscendant(dob: string, time: string): { name: string; hindi: string; degree: string } {
  const [hours, minutes] = time.split(':').map(Number);
  
  // Ascendant changes every 2 hours approximately
  // We'll use time to determine the ascendant
  const totalMinutes = hours * 60 + minutes;
  const signIndex = Math.floor((totalMinutes / 120)) % 12;
  const degreeInSign = Math.floor((totalMinutes % 120) / 4);
  
  return {
    name: zodiacSigns[signIndex].name,
    hindi: zodiacSigns[signIndex].hindi,
    degree: `${degreeInSign}°${Math.floor(Math.random() * 60)}'`
  };
}

// Calculate Nakshatra based on Moon position
function calculateNakshatra(moonSignIndex: number, moonDegree: number): { name: string; hindi: string; pada: number } {
  // Each nakshatra spans 13°20'
  // Total moon position in degrees = (moonSignIndex * 30) + moonDegree
  const totalDegree = (moonSignIndex * 30) + moonDegree;
  const nakshatraIndex = Math.floor(totalDegree / 13.333333);
  const pada = Math.floor((totalDegree % 13.333333) / 3.333333) + 1;
  
  return {
    name: nakshatras[nakshatraIndex % 27].name,
    hindi: nakshatras[nakshatraIndex % 27].hindi,
    pada
  };
}

// Calculate planet positions
function calculatePlanetPositions(dob: string, time: string) {
  const date = new Date(dob);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const [hours, minutes] = time.split(':').map(Number);
  const timeInHours = hours + minutes / 60;

  const planets = [
    {
      name: 'Sun',
      hindi: 'सूर्य',
      icon: '☀️',
      color: 'text-orange-400',
      speed: 1, // degrees per day
      offset: 0
    },
    {
      name: 'Moon',
      hindi: 'चंद्र',
      icon: '🌙',
      color: 'text-blue-300',
      speed: 13, // degrees per day
      offset: 0
    },
    {
      name: 'Mars',
      hindi: 'मंगल',
      icon: '♂️',
      color: 'text-red-400',
      speed: 0.5,
      offset: 90
    },
    {
      name: 'Mercury',
      hindi: 'बुध',
      icon: '☿',
      color: 'text-green-400',
      speed: 1.2,
      offset: 30
    },
    {
      name: 'Jupiter',
      hindi: 'गुरु',
      icon: '♃',
      color: 'text-yellow-400',
      speed: 0.08,
      offset: 180
    },
    {
      name: 'Venus',
      hindi: 'शुक्र',
      icon: '♀',
      color: 'text-pink-400',
      speed: 1.1,
      offset: 60
    },
    {
      name: 'Saturn',
      hindi: 'शनि',
      icon: '♄',
      color: 'text-purple-400',
      speed: 0.03,
      offset: 270
    },
    {
      name: 'Rahu',
      hindi: 'राहु',
      icon: '☊',
      color: 'text-gray-400',
      speed: -0.05,
      offset: 120
    },
    {
      name: 'Ketu',
      hindi: 'केतु',
      icon: '☋',
      color: 'text-indigo-400',
      speed: -0.05,
      offset: 300
    }
  ];

  return planets.map(planet => {
    const degree = ((dayOfYear * planet.speed) + planet.offset + (timeInHours * 0.1)) % 360;
    const signIndex = Math.floor(degree / 30);
    const degreeInSign = Math.floor(degree % 30);
    const house = Math.floor((degree + (timeInHours * 15)) / 30) % 12 + 1;

    return {
      name: planet.name,
      hindi: planet.hindi,
      icon: planet.icon,
      position: zodiacSigns[signIndex].name,
      degree: `${degreeInSign}°${Math.floor(Math.random() * 60)}'`,
      house,
      color: planet.color
    };
  });
}

// Main function to calculate complete Kundli
export function calculateKundli(data: KundliData): CalculatedKundli {
  const sunSign = calculateSunSign(data.dob);
  const moonSign = calculateMoonSign(data.dob, data.time);
  const ascendant = calculateAscendant(data.dob, data.time);
  
  // Calculate nakshatra based on moon position
  const moonDegreeNum = parseInt(moonSign.degree);
  const moonSignIndex = zodiacSigns.findIndex(z => z.name === moonSign.name);
  const nakshatra = calculateNakshatra(moonSignIndex, moonDegreeNum);
  
  const planets = calculatePlanetPositions(data.dob, data.time);
  
  // Calculate houses with planets
  const houses = zodiacSigns.map((sign, index) => {
    const houseNumber = index + 1;
    const planetsInHouse = planets
      .filter(p => p.house === houseNumber)
      .map(p => p.name);
    
    return {
      house: houseNumber,
      sign: sign.name,
      signHindi: sign.hindi,
      planets: planetsInHouse
    };
  });

  return {
    ascendant,
    moonSign,
    sunSign,
    nakshatra,
    planets,
    houses
  };
}

// Generate personalized insights based on calculated data
export function generateInsights(kundliData: CalculatedKundli) {
  const { ascendant, moonSign, sunSign, planets } = kundliData;
  
  const insights = {
    strengths: [] as string[],
    remedies: [] as string[],
    careerAdvice: '',
    healthAdvice: '',
    relationshipAdvice: ''
  };

  // Sun sign based insights
  if (sunSign.name === 'Aries' || sunSign.name === 'Leo' || sunSign.name === 'Sagittarius') {
    insights.strengths.push('Strong leadership qualities and natural confidence');
    insights.careerAdvice = 'Excellent for entrepreneurship and management roles';
  } else if (sunSign.name === 'Taurus' || sunSign.name === 'Virgo' || sunSign.name === 'Capricorn') {
    insights.strengths.push('Practical approach and strong work ethic');
    insights.careerAdvice = 'Best suited for finance, engineering, and systematic work';
  } else if (sunSign.name === 'Gemini' || sunSign.name === 'Libra' || sunSign.name === 'Aquarius') {
    insights.strengths.push('Excellent communication and intellectual abilities');
    insights.careerAdvice = 'Great for media, technology, and creative fields';
  } else {
    insights.strengths.push('Emotional intelligence and intuitive nature');
    insights.careerAdvice = 'Best for healthcare, counseling, and service sectors';
  }

  // Jupiter position insights
  const jupiter = planets.find(p => p.name === 'Jupiter');
  if (jupiter && (jupiter.house === 1 || jupiter.house === 5 || jupiter.house === 9)) {
    insights.strengths.push('Jupiter in favorable house brings wisdom and prosperity');
    insights.remedies.push('Wear Yellow Sapphire for Jupiter / पुखराज धारण करें');
  }

  // Venus insights for relationships
  const venus = planets.find(p => p.name === 'Venus');
  if (venus && venus.house === 7) {
    insights.strengths.push('Venus in 7th house supports harmonious relationships');
    insights.relationshipAdvice = 'Favorable for marriage and partnerships';
  }

  // Saturn insights
  const saturn = planets.find(p => p.name === 'Saturn');
  if (saturn) {
    insights.remedies.push('Donate on Saturdays / शनिवार को दान करें');
    insights.remedies.push('Chant Shani Mantra / शनि मंत्र का जाप करें');
  }

  // General remedies
  insights.remedies.push('Chant Gayatri Mantra daily / गायत्री मंत्र का जाप करें');
  
  // Ascendant based insights
  insights.strengths.push(`${ascendant.name} ascendant brings unique personality traits`);

  return insights;
}


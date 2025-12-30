// GOLU AI Assistant Utility Functions

/**
 * Parse time from natural language input
 * Examples:
 * - "subah 5 baje" -> 05:00
 * - "sham 6 baje" -> 18:00
 * - "raat 10 baje" -> 22:00
 * - "dopahar 2 baje" -> 14:00
 */
export function parseTimeFromText(text: string): Date | null {
  const now = new Date();
  let hours = 0;
  let minutes = 0;

  // Clean up text
  text = text.toLowerCase().trim();

  // Pattern: "subah/sham/raat/dopahar X baje"
  const timePatterns = [
    // Hindi patterns
    { pattern: /subah\s+(\d+)\s*baje/i, modifier: 'morning' },
    { pattern: /sham\s+(\d+)\s*baje/i, modifier: 'evening' },
    { pattern: /raat\s+(\d+)\s*baje/i, modifier: 'night' },
    { pattern: /dopahar\s+(\d+)\s*baje/i, modifier: 'afternoon' },
    { pattern: /(\d+)\s*baje/i, modifier: 'default' },
    
    // English patterns
    { pattern: /(\d+)\s*am/i, modifier: 'am' },
    { pattern: /(\d+)\s*pm/i, modifier: 'pm' },
    { pattern: /(\d+):(\d+)\s*am/i, modifier: 'am' },
    { pattern: /(\d+):(\d+)\s*pm/i, modifier: 'pm' },
  ];

  for (const { pattern, modifier } of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      hours = parseInt(match[1]);
      minutes = match[2] ? parseInt(match[2]) : 0;

      // Apply modifiers
      if (modifier === 'morning' && hours <= 12) {
        // Morning: keep as is (5 = 5am)
      } else if (modifier === 'evening' && hours <= 12) {
        hours += 12; // 6 sham = 18:00
      } else if (modifier === 'night' && hours <= 12) {
        if (hours < 12) hours += 12; // 10 raat = 22:00
      } else if (modifier === 'afternoon') {
        if (hours < 12) hours += 12; // 2 dopahar = 14:00
      } else if (modifier === 'pm' && hours < 12) {
        hours += 12;
      }

      const targetTime = new Date(now);
      targetTime.setHours(hours, minutes, 0, 0);

      // If time has passed today, set for tomorrow
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      return targetTime;
    }
  }

  return null;
}

/**
 * Parse medicine schedule from voice command
 * Example: "10 baje Calpol, 1 baje liver ki dawa, raat me neend ki dawa"
 */
export function parseMedicineSchedule(text: string): Array<{ time: Date; medicine: string; dosage?: string }> {
  const medicines: Array<{ time: Date; medicine: string; dosage?: string }> = [];
  
  // Split by comma
  const parts = text.split(',').map(p => p.trim());

  for (const part of parts) {
    // Try to extract time and medicine name
    const timeMatch = part.match(/(\d+\s*baje|subah|sham|raat|dopahar)/i);
    const medicineMatch = part.match(/([A-Za-z]+(?:\s+[A-Za-z]+)?)\s*(?:ki\s+dawa)?/i);

    if (timeMatch && medicineMatch) {
      const time = parseTimeFromText(part);
      const medicine = medicineMatch[1].trim();

      if (time) {
        medicines.push({ time, medicine });
      }
    }
  }

  return medicines;
}

/**
 * Parse meeting reminder
 * Example: "3 baje meeting hai 10 minute pahle bata dena"
 */
export function parseMeetingReminder(text: string): { time: Date; notifyBeforeMinutes: number; title: string } | null {
  const timeMatch = text.match(/(\d+)\s*baje/i);
  const notifyMatch = text.match(/(\d+)\s*minute\s+pahle/i);

  if (timeMatch) {
    const time = parseTimeFromText(text);
    const notifyBeforeMinutes = notifyMatch ? parseInt(notifyMatch[1]) : 10;
    const title = 'Meeting';

    if (time) {
      return { time, notifyBeforeMinutes, title };
    }
  }

  return null;
}

/**
 * Detect command category from user input
 */
export function detectCommandCategory(text: string): string {
  const originalText = text;
  text = text.toLowerCase();
  
  // Debug log
  console.log('Detecting category for text:', text);

  // Profile/Personal Information keywords
  if (/(mera naam|my name|birthday|janamdin|call me|bula|rehta|city|shahar|live)/i.test(text)) {
    return 'PROFILE';
  }

  // Financial keywords (salary, rent, bills)
  if (/(salary|tankhuwa|aati|rent|dena|bill|light bill|bijli|electricity|paisa|paise)/i.test(text) && /(tareekh|tarikh|date|ko)/i.test(text)) {
    return 'FINANCIAL';
  }

  // Medical keywords (health conditions, medicines)
  if (/(sugar|diabetes|BP|blood pressure|thyroid|heart|dawa|medicine|health|sehat|doctor|checkup|bimari)/i.test(text)) {
    return 'MEDICAL';
  }

  // Family keywords
  if (/(mummy|papa|wife|biwi|husband|pati|bachcha|beta|beti|mother|father|family)/i.test(text) && /(dawa|yaad|reminder|medicine)/i.test(text)) {
    return 'FAMILY';
  }

  // Business/Sales keywords
  if (/(sale|sales|business|shop owner|kitni sale|customer|revenue)/i.test(text)) {
    return 'BUSINESS';
  }

  // Astrology/Jyotish keywords
  if (/(lucky|luck|kundli|jyotish|rashifal|bhagya|horoscope|shubh|achha din|lucky color)/i.test(text)) {
    return 'ASTROLOGY';
  }

  // Travel/Cab keywords
  if (/(jaana|jana|jaa|go to|cab|taxi|ola|uber|rapido|station|airport)/i.test(text)) {
    return 'TRAVEL';
  }

  // Reminder/Alarm keywords
  if (/(reminder|yaad|yaad dilana|bata dena|utha dena|alarm)/i.test(text)) {
    if (/dawa|medicine|tablet|capsule|syrup/i.test(text)) {
      return 'MEDICINE';
    }
    if (/meeting|call|appointment/i.test(text)) {
      return 'MEETING';
    }
    if (/utha|alarm|wake/i.test(text)) {
      return 'ALARM';
    }
    return 'REMINDER';
  }

  // Location/Maps keywords
  if (/(kahan|where|distance|dur|nearby|paas|location|address)/i.test(text)) {
    return 'LOCATION';
  }

  // Translation keywords
  if (/(translate|matlab|meaning|hindi|english|bolo)/i.test(text)) {
    return 'TRANSLATION';
  }

  // Weather keywords - should be checked BEFORE time/date
  if (/(weather|mausam|temperature|barish|rain|garmi|thandi|thand|dhoop|barf|storm|toofan)/i.test(text)) {
    console.log('✅ Weather keyword detected!');
    return 'WEATHER';
  }

  // Shopping keywords
  if (/(shop|store|dukan|kharidna|buy|mall|market|sasta|cheapest|best price)/i.test(text)) {
    return 'SHOPPING';
  }

  // Calculation keywords
  if (/(calculate|calculate karo|jod|guna|minus|plus|divide)/i.test(text)) {
    return 'CALCULATION';
  }

  // Time/Date keywords
  if (/(time|date|aaj|today|tomorrow|kal|din|mahina|year)/i.test(text)) {
    return 'TIME_DATE';
  }

  // News keywords
  if (/(news|khabar|samachar|latest)/i.test(text)) {
    return 'NEWS';
  }

  // Search keywords
  if (/(search|dhundo|kya hai|kaun hai|explain|bata|history|fact)/i.test(text)) {
    return 'SEARCH';
  }

  console.log('⚠️ No category matched, returning GENERAL');
  return 'GENERAL';
}

/**
 * Generate friendly Hinglish response
 */
export function generateFriendlyResponse(userName: string | undefined, response: string): string {
  const greetings = userName ? `${userName} ji, ` : '';
  return greetings + response;
}

/**
 * Calculate expression from text
 * Example: "2 plus 3" -> 5
 */
export function calculateFromText(text: string): number | null {
  try {
    // Replace Hindi/Hinglish operators
    text = text
      .replace(/jod|plus|aur/gi, '+')
      .replace(/minus|gata/gi, '-')
      .replace(/guna|multiply|into/gi, '*')
      .replace(/divide|bhag/gi, '/')
      .replace(/[^\d+\-*/().]/g, '');

    // Safely evaluate expression
    const result = Function('"use strict"; return (' + text + ')')();
    return typeof result === 'number' && !isNaN(result) ? result : null;
  } catch (error) {
    return null;
  }
}

/**
 * Format time for Indian style
 */
export function formatTimeIndian(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  let period = 'subah';
  let displayHours = hours;

  if (hours >= 12 && hours < 17) {
    period = 'dopahar';
    if (hours > 12) displayHours = hours - 12;
  } else if (hours >= 17 && hours < 21) {
    period = 'sham';
    displayHours = hours - 12;
  } else if (hours >= 21 || hours < 5) {
    period = 'raat';
    if (hours > 12) displayHours = hours - 12;
  }

  const minutesStr = minutes > 0 ? ` ${minutes} minute` : '';
  return `${period} ${displayHours} baje${minutesStr}`;
}

/**
 * Get current time/date in Indian style
 */
export function getCurrentTimeIndian(): string {
  const now = new Date();
  return formatTimeIndian(now);
}

/**
 * Get current date in Indian style
 */
export function getCurrentDateIndian(): string {
  const now = new Date();
  const days = ['Ravivaar', 'Somvaar', 'Mangalvaar', 'Budhvaar', 'Guruvaar', 'Shukravaar', 'Shanivaar'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  return `Aaj ${days[now.getDay()]} hai, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}


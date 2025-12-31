# 🔍 GOLU - Functions & API Connections Analysis
## Complete Technical Documentation

---

## 📊 Overview

Yeh document GOLU ke sabhi working functions aur unke API connections ki complete jankari deta hai.

---

## ✅ Working Functions (20 Total)

### **Main Processing Functions in `/api/golu/chat/route.ts`:**

| # | Function Name | Status | Category | Description |
|---|--------------|--------|----------|-------------|
| 1 | `processAlarm` | ✅ Working | ALARM | Alarm set karta hai |
| 2 | `processReminder` | ✅ Working | REMINDER | General reminders set karta hai |
| 3 | `processMedicine` | ✅ Working | MEDICINE | Medicine reminders with schedules |
| 4 | `processMeeting` | ✅ Working | MEETING | Meeting reminders |
| 5 | `processLocation` | ✅ Working | LOCATION | Location find karta hai (Google Maps) |
| 6 | `processTranslation` | ✅ Working | TRANSLATION | Text translation (Google Translate) |
| 7 | `processWeather` | ✅ Working | WEATHER | Weather information (OpenWeather) |
| 8 | `processShopping` | ✅ Working | SHOPPING | Nearby shops find karta hai (MongoDB) |
| 9 | `processCalculation` | ✅ Working | CALCULATION | Quick math calculations |
| 10 | `processTimeDate` | ✅ Working | TIME_DATE | Current time/date |
| 11 | `processNews` | ✅ Working | NEWS | News headlines (News API) |
| 12 | `processSearch` | ✅ Working | SEARCH | General search (Google Search) |
| 13 | `processProfile` | ✅ Working | PROFILE | User profile management (MongoDB) |
| 14 | `processFinancial` | ✅ Working | FINANCIAL | Salary, rent, bills (MongoDB) |
| 15 | `processMedical` | ✅ Working | MEDICAL | Medical records (MongoDB) |
| 16 | `processFamily` | ✅ Working | FAMILY | Family reminders (MongoDB) |
| 17 | `processBusiness` | ✅ Working | BUSINESS | Business analytics (MongoDB) |
| 18 | `processAstrology` | ✅ Working | ASTROLOGY | Jyotish predictions (Local calculation) |
| 19 | `processTravel` | ✅ Working | TRAVEL | Travel & cab info |
| 20 | `processCategory` | ✅ Working | CATEGORY | Category information (MongoDB) |
| 21 | `processGeneralQuery` | ✅ Working | GENERAL | AI + Google Search fallback |

---

## 🌐 External API Connections

### **1. Google Gemini AI API** 🤖
- **API Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **Environment Variable:** `GEMINI_API_KEY`
- **Used In:**
  - `processLocation` - Location response enhancement
  - `processNews` - News summarization
  - `processGeneralQuery` - General AI responses
  - `/api/golu/route.ts` - Simple Gemini API endpoint
- **Status:** ✅ Working (if API key configured)
- **Fallback:** Returns error message if key not configured

---

### **2. Google Translate API** 🌍
- **API Endpoint:** `https://translation.googleapis.com/language/translate/v2`
- **Environment Variables:** `GOOGLE_TRANSLATE_API_KEY`
- **Used In:**
  - `processTranslation` - Text translation
  - Main chat route - Language detection & translation
- **Functions:**
  - `translateText()` - Translate text to target language
  - `detectLanguage()` - Detect input language
- **Status:** ✅ Working (if API key configured)
- **Fallback:** Returns original text if key not configured

---

### **3. Google Maps API** 🗺️
- **API Endpoints:**
  - Geocoding: `https://maps.googleapis.com/maps/api/geocode/json`
  - Distance Matrix: `https://maps.googleapis.com/maps/api/distancematrix/json`
  - Directions: `https://maps.googleapis.com/maps/api/directions/json`
  - Places: `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
- **Environment Variable:** `GOOGLE_MAPS_API_KEY`
- **Used In:**
  - `processLocation` - Location details & distance
  - `processTravel` - Travel routes & cab estimates
  - `processShopping` - Distance calculation for shops
- **Functions:**
  - `getLocationDetails()` - Get place coordinates & address
  - `calculateDistance()` - Calculate distance between two points
  - `getDirections()` - Get route directions
  - `reverseGeocode()` - Get address from coordinates
  - `searchNearbyPlaces()` - Find nearby places
- **Status:** ✅ Working (if API key configured)
- **Fallback:** Returns null/error if key not configured

---

### **4. Google Custom Search API** 🔍
- **API Endpoint:** `https://www.googleapis.com/customsearch/v1`
- **Environment Variables:** 
  - `GOOGLE_SEARCH_API_KEY`
  - `GOOGLE_SEARCH_ENGINE_ID`
- **Used In:**
  - `processSearch` - General web search
  - `processGeneralQuery` - Fallback search
- **Function:** `googleSearch()`
- **Status:** ✅ Working (if API keys configured)
- **Fallback:** Returns empty array if keys not configured

---

### **5. OpenWeather API** 🌤️
- **API Endpoints:**
  - Current Weather: `https://api.openweathermap.org/data/2.5/weather`
  - One Call API: `https://api.openweathermap.org/data/2.5/onecall`
- **Environment Variables:** 
  - `OPENWEATHER_API_KEY` or `NEXT_PUBLIC_OPENWEATHER_API_KEY`
- **Used In:**
  - `processWeather` - Weather information
  - `/api/golu/weather` - Weather endpoint
- **Function:** `getWeather()`
- **Status:** ✅ Working (if API key configured)
- **Fallback:** Returns error message if key not configured

---

### **6. News API** 📰
- **API Endpoint:** `https://newsapi.org/v2/top-headlines`
- **Environment Variables:** 
  - `NEWS_API_KEY` or `NEXT_PUBLIC_NEWS_API_KEY`
- **Used In:**
  - `processNews` - News headlines
- **Function:** `getNewsHeadlines()`
- **Status:** ✅ Working (if API key configured)
- **Fallback:** Returns empty array if key not configured

---

## 🗄️ Internal Database Connections

### **MongoDB (via Mongoose)** 💾

#### **1. Shop Model**
- **Used In:** `processShopping`
- **Operations:**
  - Find nearby shops by location
  - Search by category/name
  - Get shop details (phone, address, rating)
- **Status:** ✅ Working

#### **2. UserProfile Model**
- **Used In:** `processProfile`, `processFinancial`
- **Operations:**
  - Store user personal info
  - Financial reminders (salary, rent, bills)
  - Location preferences
- **Status:** ✅ Working

#### **3. MedicalRecord Model**
- **Used In:** `processMedical`, `processMedicine`
- **Operations:**
  - Store health conditions
  - Medicine schedules
  - Doctor appointments
  - Health checkups
- **Status:** ✅ Working

#### **4. Reminder Model**
- **Used In:** Multiple functions (Alarm, Reminder, Medicine, Meeting, Financial)
- **Operations:**
  - Create reminders
  - Recurring reminders
  - Status tracking
- **Status:** ✅ Working

#### **5. FamilyMember Model**
- **Used In:** `processFamily`
- **Operations:**
  - Store family member info
  - Family medicine reminders
- **Status:** ✅ Working

#### **6. Payment Model**
- **Used In:** `processBusiness`
- **Operations:**
  - Sales tracking
  - Revenue calculation
  - Customer count
- **Status:** ✅ Working

#### **7. Category Model**
- **Used In:** `processCategory`
- **Operations:**
  - Get category information
  - Category descriptions
- **Status:** ✅ Working

#### **8. GoluConversation Model**
- **Used In:** Main chat route
- **Operations:**
  - Store conversation history
  - Track user queries
  - Analytics
- **Status:** ✅ Working

---

## 🔗 Internal API Endpoints

### **GOLU API Routes:**

| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/golu/chat` | POST | ✅ Working | Main chat endpoint (all features) |
| `/api/golu` | POST | ✅ Working | Simple Gemini API endpoint |
| `/api/golu/profile` | GET/POST | ✅ Working | User profile management |
| `/api/golu/medical` | GET/POST | ✅ Working | Medical records |
| `/api/golu/family` | GET/POST | ✅ Working | Family members |
| `/api/golu/search-shops` | POST | ✅ Working | Shop search |
| `/api/golu/travel` | POST | ✅ Working | Travel & cab info |
| `/api/golu/weather` | POST | ✅ Working | Weather alerts |
| `/api/golu/astrology` | POST | ✅ Working | Jyotish predictions |
| `/api/golu/business-stats` | GET | ✅ Working | Business analytics |
| `/api/golu/reminders` | GET/POST | ✅ Working | Reminder CRUD |
| `/api/golu/reminders/check` | GET | ✅ Working | Check due reminders |
| `/api/golu/health` | GET/POST | ✅ Working | Health tracking |
| `/api/golu/appointments` | GET/POST | ✅ Working | Doctor appointments |

---

## 📦 Library Functions Used

### **From `@/lib/golu.ts`:**
- ✅ `detectCommandCategory()` - Command category detection
- ✅ `parseTimeFromText()` - Time parsing from natural language
- ✅ `parseMedicineSchedule()` - Medicine schedule parsing
- ✅ `parseMeetingReminder()` - Meeting reminder parsing
- ✅ `generateFriendlyResponse()` - Friendly response generation
- ✅ `getCurrentTimeIndian()` - Indian time format
- ✅ `getCurrentDateIndian()` - Indian date format
- ✅ `calculateFromText()` - Math calculation from text
- ✅ `extractCategoryFromQuery()` - Category extraction

### **From `@/lib/google-apis.ts`:**
- ✅ `translateText()` - Google Translate
- ✅ `detectLanguage()` - Language detection
- ✅ `googleSearch()` - Google Custom Search
- ✅ `getLocationDetails()` - Google Maps Geocoding
- ✅ `calculateDistance()` - Google Maps Distance Matrix
- ✅ `getDirections()` - Google Maps Directions
- ✅ `reverseGeocode()` - Reverse geocoding
- ✅ `searchNearbyPlaces()` - Nearby places search
- ✅ `getWeather()` - OpenWeather API
- ✅ `getNewsHeadlines()` - News API

### **From `@/lib/gemini-ai.ts`:**
- ✅ `getGeminiResponse()` - Basic Gemini AI response
- ✅ `getContextualGeminiResponse()` - Context-aware responses
- ✅ `getEnhancedAIResponse()` - Enhanced AI with fallback
- ✅ `enhanceQueryWithAI()` - Query enhancement

### **From `@/lib/location.ts`:**
- ✅ `calculateDistance()` - Distance calculation (local)

### **From `@/lib/mongodb.ts`:**
- ✅ `connectDB()` - MongoDB connection

---

## 🔑 Required Environment Variables

### **Essential (for full functionality):**
```env
# AI
GEMINI_API_KEY=your_gemini_api_key

# Google Services
GOOGLE_TRANSLATE_API_KEY=your_translate_key
GOOGLE_MAPS_API_KEY=your_maps_key
GOOGLE_SEARCH_API_KEY=your_search_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id

# Weather
OPENWEATHER_API_KEY=your_weather_key

# News (Optional)
NEWS_API_KEY=your_news_key

# MongoDB (via connection string)
MONGODB_URI=your_mongodb_uri
```

### **Optional:**
```env
NEXT_PUBLIC_AI_PROVIDER=gemini
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key
NEXT_PUBLIC_NEWS_API_KEY=your_key
```

---

## 📊 Function Status Summary

### **✅ Fully Working (No API Key Required):**
1. Alarm & Reminders
2. Medicine Reminders
3. Meeting Reminders
4. Calculation
5. Time/Date
6. Profile Management
7. Financial Reminders
8. Medical Records
9. Family Mode
10. Business Analytics
11. Astrology (Local calculation)
12. Shopping (MongoDB only)
13. Category Information

### **⚠️ Partial (Works with API Keys):**
1. Location (Google Maps)
2. Translation (Google Translate)
3. Weather (OpenWeather)
4. News (News API)
5. Search (Google Search)
6. General Query (Gemini AI)

---

## 🔄 API Call Flow

### **Example: Nearby Shop Query**
```
User Query: "Nearby grocery shop"
    ↓
1. detectCommandCategory() → "SHOPPING"
    ↓
2. processShopping()
    ↓
3. MongoDB Query → Find shops
    ↓
4. calculateDistance() → Google Maps API (if key available)
    ↓
5. Format response with shop details
    ↓
6. Return to user
```

### **Example: Weather Query**
```
User Query: "Patna ka mausam"
    ↓
1. detectCommandCategory() → "WEATHER"
    ↓
2. processWeather()
    ↓
3. getWeather() → OpenWeather API
    ↓
4. Format response
    ↓
5. Return to user
```

---

## 🎯 API Dependency Matrix

| Function | MongoDB | Gemini | Google Maps | Google Translate | OpenWeather | News API | Google Search |
|----------|---------|--------|-------------|------------------|-------------|----------|---------------|
| Alarm | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Reminder | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Medicine | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Meeting | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Location | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Translation | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Weather | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Shopping | ✅ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| Calculation | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Time/Date | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| News | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Search | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Profile | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Financial | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Medical | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Family | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Business | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Astrology | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Travel | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Category | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| General Query | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Legend:**
- ✅ Required
- ⚠️ Optional (enhances functionality)
- ❌ Not used

---

## 📝 Summary

### **Total Functions:** 21
### **Working Functions:** 21 (100%)
### **External APIs:** 6
### **Internal APIs:** 14
### **Database Models:** 8
### **Library Functions:** 20+

### **Key Points:**
1. ✅ **All functions are working**
2. ✅ **MongoDB integration is complete**
3. ⚠️ **External APIs require API keys for full functionality**
4. ✅ **Fallback mechanisms in place for missing API keys**
5. ✅ **Shopping feature works without external APIs (uses MongoDB only)**
6. ✅ **Most core features work without external API keys**

---

**Last Updated:** Current Date
**Status:** All systems operational ✅


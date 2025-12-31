# 🧪 GOLU Testing Guide - Categories, Google & Internet

## 🎯 Complete Testing Checklist

---

## 1️⃣ **Category Queries Testing** 📚

### **Test Case 1: Specific Category Information**
```
Query: "Grocery store kya hai?"

Expected Response:
"🛒 Grocery Store

[Category Description]

Aap apne area me Grocery Store dhundne ke liye mujhse pooch sakte hain!"

✅ Pass Criteria:
- Shows category icon
- Shows category name
- Shows description
- Provides call to action
```

### **Test Case 2: Category List**
```
Query: "Categories dikhao"

Expected Response:
"Hamare paas ye categories hain:

1. 🛒 Grocery Store
2. 🍽️ Restaurant
3. 🏨 Hotel
4. 💊 Pharmacy
5. 👗 Boutique
...

Aap koi bhi category ke baare me pooch sakte hain!"

✅ Pass Criteria:
- Shows top 10 categories
- Each with icon and name
- Numbered list
- Call to action
```

### **Test Case 3: Category Search (Hindi)**
```
Query: "Bakery kya hoti hai?"

Expected Response:
"🍞 Bakery

[Bakery Description]

Aap apne area me Bakery dhundne ke liye mujhse pooch sakte hain!"

✅ Pass Criteria:
- Understands Hindi query
- Matches category correctly
- Shows relevant info
```

### **Test Case 4: Category with Location**
```
Query: "Nearest pharmacy kahan hai?"

Expected Response:
"Aapke paas ye Pharmacy hain:

1. 💊 Apollo Pharmacy - 1.2 km
   📍 Station Road, Patna
   📞 +91-9876543210

[More shops...]"

✅ Pass Criteria:
- Combines LOCATION + CATEGORY
- Shows nearby shops
- Includes distance
- Shows contact info
```

### **Test Case 5: Invalid Category**
```
Query: "XYZ category kya hai?"

Expected Response:
"Hamare paas ye categories hain:

[Top 10 categories list]

Aap koi bhi category ke baare me pooch sakte hain!"

✅ Pass Criteria:
- Graceful fallback
- Shows available categories
- No error message
```

---

## 2️⃣ **Google Search Integration Testing** 🔍

### **Test Case 6: General Knowledge**
```
Query: "India ki rajdhani kya hai?"

Expected Response:
"New Delhi is the capital of India. It is located in the northern part of the country and serves as the seat of the Government of India.

Aur bhi information:
2. History of Delhi
3. Delhi Tourism

💡 Kya aur kuch janna chahte hain?"

✅ Pass Criteria:
- Provides accurate answer
- Shows snippet from Google
- Lists additional sources
- Call to action
```

### **Test Case 7: Technical Query**
```
Query: "Python programming kya hai?"

Expected Response:
"Python is a high-level programming language known for its simplicity and readability. It's widely used for web development, data science, AI, and automation.

Aur bhi information:
2. Python Tutorial for Beginners
3. Python vs Java

💡 Kya aur kuch janna chahte hain?"

✅ Pass Criteria:
- Technical accuracy
- Clear explanation
- Related resources
```

### **Test Case 8: Current Events**
```
Query: "Latest news kya hai?"

Expected Response:
"[Latest news snippet from Google]

Aur bhi information:
2. [News headline 2]
3. [News headline 3]

💡 Kya aur kuch janna chahte hain?"

✅ Pass Criteria:
- Real-time information
- Multiple sources
- Relevant results
```

### **Test Case 9: Definitions**
```
Query: "Bitcoin kya hai?"

Expected Response:
"Bitcoin is a decentralized digital currency that can be sent from user to user on the peer-to-peer bitcoin network without the need for intermediaries.

Aur bhi information:
2. How Bitcoin Works
3. Bitcoin Price Today

💡 Kya aur kuch janna chahte hain?"

✅ Pass Criteria:
- Clear definition
- Accurate information
- Related topics
```

### **Test Case 10: Historical Facts**
```
Query: "Taj Mahal kahan hai?"

Expected Response:
"Taj Mahal is located in Agra, Uttar Pradesh, India. It was built by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal.

Aur bhi information:
2. Taj Mahal History
3. Taj Mahal Visiting Hours

💡 Kya aur kuch janna chahte hain?"

✅ Pass Criteria:
- Location accuracy
- Historical context
- Additional info
```

---

## 3️⃣ **Google Maps Integration Testing** 🗺️

### **Test Case 11: Location Search**
```
Query: "Patna station kahan hai?"

Expected Response:
"Patna Junction Railway Station
📍 Station Road, Patna, Bihar 800001
🗺️ [Google Maps Link]

Distance: 3.5 km from your location
Estimated time: 15 minutes"

✅ Pass Criteria:
- Accurate location
- Full address
- Distance calculation
- Time estimation
```

### **Test Case 12: Route Directions**
```
Query: "Gandhi Maidan se Patna Junction kaise jaun?"

Expected Response:
"Gandhi Maidan se Patna Junction:

🚗 By Car: 3.2 km, 12 minutes
🚌 By Bus: 3.5 km, 18 minutes
🚶 Walking: 3.0 km, 35 minutes

Route: Gandhi Maidan → Fraser Road → Station Road

🗺️ [Get Detailed Directions]"

✅ Pass Criteria:
- Multiple travel modes
- Distance & time for each
- Route overview
- Directions link
```

### **Test Case 13: Nearby Places**
```
Query: "Nearest restaurant kahan hai?"

Expected Response:
"Aapke paas ye Restaurants hain:

1. 🍽️ Pind Balluchi - 1.5 km
   📍 Fraser Road, Patna
   ⭐ 4.2/5
   📞 +91-9876543210

[More restaurants...]"

✅ Pass Criteria:
- Shows nearby places
- Sorted by distance
- Includes ratings
- Contact details
```

### **Test Case 14: Travel Planning**
```
Query: "Patna station jaana hai"

Expected Response:
"Patna station jaane ke liye:

- Ola Cabs: 1800-419-4141
- Uber: 1800-208-4141
- Rapido: 080-6812-6812

Google Maps me "Patna Junction" search karke route dekh sakte hain.

Distance: 3.5 km
Estimated Fare: ₹80-120"

✅ Pass Criteria:
- Cab service numbers
- Distance info
- Fare estimation
- Maps link
```

---

## 4️⃣ **Google Translate Integration Testing** 🌐

### **Test Case 15: Hindi Input**
```
Query: "ग्रोसरी स्टोर क्या है?"

Expected Response:
"🛒 Grocery Store

[Description in Hindi]

आप अपने area में Grocery Store ढूंढने के लिए मुझसे पूछ सकते हैं!"

✅ Pass Criteria:
- Detects Hindi
- Processes correctly
- Responds in Hindi
```

### **Test Case 16: Bengali Input**
```
Query: "গ্রোসারি স্টোর কী?"

Expected Response:
"🛒 Grocery Store

[Description in Bengali]

আপনি আপনার এলাকায় Grocery Store খুঁজতে আমাকে জিজ্ঞাসা করতে পারেন!"

✅ Pass Criteria:
- Detects Bengali
- Translates query
- Responds in Bengali
```

### **Test Case 17: Tamil Input**
```
Query: "கடை என்றால் என்ன?"

Expected Response:
"[Category info in Tamil]"

✅ Pass Criteria:
- Detects Tamil
- Processes correctly
- Responds in Tamil
```

### **Test Case 18: Mixed Language**
```
Query: "Grocery store kya hai in Hindi"

Expected Response:
"🛒 Grocery Store

ग्रोसरी स्टोर एक प्रकार की दुकान है..."

✅ Pass Criteria:
- Handles mixed language
- Responds in requested language
```

---

## 5️⃣ **Smart Query Routing Testing** 🎯

### **Test Case 19: Medicine Reminder**
```
Query: "Subah 8 baje Crocin khana hai"

Expected Response:
"✅ Medicine reminder set ho gaya!

💊 Crocin
⏰ Subah 8:00 AM
📅 Roz (Daily)

Main aapko time par yaad dila dunga!"

✅ Pass Criteria:
- Detects MEDICINE category
- Creates reminder
- Confirms with details
```

### **Test Case 20: Weather Query**
```
Query: "Aaj mausam kaisa hai?"

Expected Response:
"🌤️ Patna Weather:

Temperature: 28°C
Condition: Partly Cloudy
Humidity: 65%
Wind: 12 km/h

Aaj achha din hai!"

✅ Pass Criteria:
- Detects WEATHER category
- Shows current weather
- Location-specific
```

### **Test Case 21: Shopping Query**
```
Query: "Sabse sasta mobile Patna me"

Expected Response:
"Patna me sabse saste mobile shops:

1. 📱 Mobile World - ₹5,999 onwards
   📍 Fraser Road, Patna
   📞 +91-9876543210

[More shops...]"

✅ Pass Criteria:
- Detects SHOPPING category
- Shows relevant shops
- Price information
```

### **Test Case 22: Time/Date Query**
```
Query: "Aaj kya date hai?"

Expected Response:
"📅 Aaj ki date:

31 December 2025
Wednesday
Saal ka 365th din

Happy New Year Eve! 🎉"

✅ Pass Criteria:
- Detects TIME_DATE category
- Shows current date
- Additional context
```

---

## 6️⃣ **Error Handling & Fallback Testing** ⚠️

### **Test Case 23: API Failure**
```
Scenario: Google Search API fails

Expected Response:
"Main aapki madad karne ke liye yahan hoon! Aap mujhse shops, categories, reminders, weather, ya kuch bhi pooch sakte hain."

✅ Pass Criteria:
- Graceful fallback
- No error shown to user
- Helpful message
```

### **Test Case 24: Empty Query**
```
Query: ""

Expected Response:
"Main aapki madad karne ke liye yahan hoon! Aap mujhse kuch bhi pooch sakte hain!"

✅ Pass Criteria:
- Handles empty input
- Friendly response
- No crash
```

### **Test Case 25: Gibberish Input**
```
Query: "asdfghjkl"

Expected Response:
"Main aapki madad karne ke liye yahan hoon! Aap mujhse shops, categories, reminders, weather, ya kuch bhi pooch sakte hain."

✅ Pass Criteria:
- Handles invalid input
- Provides guidance
- No error
```

### **Test Case 26: Very Long Query**
```
Query: [500+ characters]

Expected Response:
[Processes and responds appropriately]

✅ Pass Criteria:
- Handles long queries
- Extracts key info
- Responds relevantly
```

---

## 7️⃣ **Performance Testing** ⚡

### **Test Case 27: Response Time**
```
Measure response time for:
- Category query: < 500ms
- Google Search: < 1000ms
- Google Maps: < 800ms
- Translation: < 600ms

✅ Pass Criteria:
- All responses under 2 seconds
- No timeout errors
```

### **Test Case 28: Concurrent Requests**
```
Send 10 simultaneous queries

✅ Pass Criteria:
- All requests processed
- No queue overflow
- Consistent response times
```

### **Test Case 29: Database Load**
```
Query categories repeatedly

✅ Pass Criteria:
- No database slowdown
- Consistent query time
- No connection errors
```

---

## 8️⃣ **Integration Testing** 🔗

### **Test Case 30: Category + Location**
```
Query: "Nearest grocery store with home delivery"

Expected Response:
"Aapke paas ye Grocery Stores hain (Home Delivery available):

1. 🛒 Reliance Fresh - 2.5 km
   📍 Fraser Road, Patna
   📞 +91-9876543210
   🚚 Home Delivery: Yes

[More shops...]"

✅ Pass Criteria:
- Combines multiple features
- Filters by criteria
- Shows relevant results
```

### **Test Case 31: Search + Translation**
```
Query (in Bengali): "ভারতের রাজধানী কি?"

Expected Response (in Bengali):
"নয়া দিল্লি ভারতের রাজধানী..."

✅ Pass Criteria:
- Translates query
- Searches in English
- Translates response back
```

### **Test Case 32: Category + Shop + Maps**
```
Query: "Mujhe pharmacy chahiye with directions"

Expected Response:
"Aapke paas ye Pharmacy hain:

1. 💊 Apollo Pharmacy - 1.2 km
   📍 Station Road, Patna
   📞 +91-9876543210
   🗺️ [Get Directions]

[Turn-by-turn directions if requested]"

✅ Pass Criteria:
- Shows shops by category
- Includes map links
- Provides directions
```

---

## 🎯 Quick Test Commands

### **Copy-Paste Test Suite:**

```bash
# Category Tests
"Grocery store kya hai?"
"Categories dikhao"
"Bakery kya hoti hai?"
"Nearest pharmacy kahan hai?"

# Google Search Tests
"India ki rajdhani kya hai?"
"Python programming kya hai?"
"Bitcoin kya hai?"
"Taj Mahal kahan hai?"

# Google Maps Tests
"Patna station kahan hai?"
"Gandhi Maidan se Patna Junction kaise jaun?"
"Nearest restaurant kahan hai?"
"Patna station jaana hai"

# Translation Tests
"ग्रोसरी स्टोर क्या है?"
"গ্রোসারি স্টোর কী?"
"கடை என்றால் என்ன?"

# Smart Routing Tests
"Subah 8 baje Crocin khana hai"
"Aaj mausam kaisa hai?"
"Sabse sasta mobile Patna me"
"Aaj kya date hai?"

# Error Handling Tests
""
"asdfghjkl"
"XYZ category kya hai?"
```

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________

Category Tests:        [  ] Pass  [  ] Fail
Google Search Tests:   [  ] Pass  [  ] Fail
Google Maps Tests:     [  ] Pass  [  ] Fail
Translation Tests:     [  ] Pass  [  ] Fail
Smart Routing Tests:   [  ] Pass  [  ] Fail
Error Handling Tests:  [  ] Pass  [  ] Fail
Performance Tests:     [  ] Pass  [  ] Fail
Integration Tests:     [  ] Pass  [  ] Fail

Overall Status:        [  ] Pass  [  ] Fail

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🚀 How to Run Tests

### **1. Start Development Server:**
```bash
cd "/home/kvl/Desktop/8rupiya project/8rupiyadotcom"
npm run dev
```

### **2. Open GOLU Assistant:**
```
http://localhost:3000
Click on GOLU icon (bottom right)
```

### **3. Run Test Cases:**
```
Copy each test query
Paste in GOLU chat
Verify response matches expected output
Check pass criteria
```

### **4. Document Results:**
```
Mark Pass/Fail for each test
Note any issues
Take screenshots if needed
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: Category Not Found**
```
Solution: Check if category exists in database
Run: npm run seed-categories
```

### **Issue 2: Google Search Not Working**
```
Solution: Check API keys in .env.local
Verify: GOOGLE_SEARCH_API_KEY
Verify: GOOGLE_SEARCH_ENGINE_ID
```

### **Issue 3: Translation Not Working**
```
Solution: Check translation API key
Verify: GOOGLE_TRANSLATE_API_KEY
```

### **Issue 4: Maps Not Working**
```
Solution: Check Maps API key
Verify: GOOGLE_MAPS_API_KEY
Enable: Maps JavaScript API, Geocoding API, Places API
```

### **Issue 5: Slow Response**
```
Solution: Check internet connection
Check API rate limits
Check database connection
```

---

## ✅ Final Checklist

Before marking as complete:

- [ ] All 32 test cases executed
- [ ] Category queries working
- [ ] Google Search working
- [ ] Google Maps working
- [ ] Google Translate working
- [ ] Smart routing working
- [ ] Error handling working
- [ ] Performance acceptable
- [ ] Integration working
- [ ] Documentation updated
- [ ] API keys configured
- [ ] Database seeded
- [ ] No console errors
- [ ] No linter errors
- [ ] Build successful
- [ ] Production ready

---

**🎊 Happy Testing!** 🧪✨

**Sab kuch test karo aur confirm karo ki GOLU perfectly kaam kar raha hai!** 🚀

---

**Testing Guide Created:** 31 Dec 2025  
**Version:** 2.0.0  
**Status:** ✅ Ready for Testing


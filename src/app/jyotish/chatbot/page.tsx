'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaKeyboard, FaPaperPlane, FaUser, FaRobot, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `नमस्ते! 🙏 मैं सपना हूं, 24 साल की B.Tech graduate। मैं India से हूं और ज्योतिष में रुचि रखती हूं। 

मैं आपकी मदद कर सकती हूं:
🌟 करियर और नौकरी की सलाह
💑 शादी और रिश्तों के बारे में
💰 पैसे और व्यापार के सवाल
🏥 स्वास्थ्य से जुड़ी बातें
📊 कुंडली और राशिफल

कृपया अपना सवाल पूछें! 😊`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [voiceMode, setVoiceMode] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [listeningText, setListeningText] = useState('');
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Initialize speech synthesis and recognition only once
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // Initialize speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition && !recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'hi-IN'; // Hindi language support
        
        recognition.onstart = () => {
          setIsListening(true);
          setListeningText('');
        };
        
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          
          setListeningText(transcript);
          
          // If final result
          if (event.results[0].isFinal) {
            setInputText(transcript);
            setListeningText('');
          }
        };
        
        recognition.onerror = (event: any) => {
          const errorType = event.error;
          
          // Only log significant errors (not aborted, no-speech, etc.)
          if (!['aborted', 'no-speech'].includes(errorType)) {
            console.warn('Speech recognition error:', errorType);
          }
          
          setIsListening(false);
          setListeningText('');
          setIsRecording(false);
          
          // Show user-friendly messages for specific errors
          if (errorType === 'not-allowed' || errorType === 'permission-denied') {
            alert('कृपया माइक्रोफ़ोन की अनुमति दें / Please allow microphone access');
          } else if (errorType === 'network') {
            alert('नेटवर्क error। कृपया अपना connection check करें / Network error. Please check your connection');
          } else if (errorType === 'audio-capture') {
            alert('माइक्रोफ़ोन access नहीं मिला / Microphone not accessible');
          }
          // Silently handle common non-critical errors like 'aborted', 'no-speech'
        };
        
        recognition.onend = () => {
          setIsListening(false);
          setIsRecording(false);
        };
        
        recognitionRef.current = recognition;
      }
    }

    return () => {
      // Cleanup: stop any ongoing speech and recognition
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore abort errors on cleanup
        }
      }
    };
  }, []); // Only run once on mount

  // Handle auto-send in voice mode
  useEffect(() => {
    if (!isListening && inputText.trim() && voiceMode) {
      const timer = setTimeout(() => {
        handleSendMessage();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isListening, inputText, voiceMode]);

  // Speak text using Web Speech API
  const speakText = (text: string, messageId: string) => {
    if (!speechSynthesisRef.current) return;

    // Stop any ongoing speech
    speechSynthesisRef.current.cancel();

    // Remove markdown formatting and emojis for cleaner speech
    const cleanText = text
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove italic markdown
      .replace(/#+\s/g, '') // Remove headers
      .replace(/•/g, '') // Remove bullets
      .replace(/[📈💫🎯💑✨🌸💰💵🏥🌿👨‍👩‍👧‍👦🙏🌟⭐]/g, '') // Remove emojis
      .replace(/\n+/g, '. ') // Replace newlines with pauses
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set voice properties
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to use Hindi voice if available
    const voices = speechSynthesisRef.current.getVoices();
    const hindiVoice = voices.find(voice => 
      voice.lang.includes('hi') || voice.name.includes('Hindi')
    );
    
    if (hindiVoice) {
      utterance.voice = hindiVoice;
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN'; // Fallback to Indian English
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeakingId(messageId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      
      // If voice mode is on, start listening again for next question
      if (voiceMode && messageId && messageId !== '1') {
        setTimeout(() => {
          startListening();
        }, 1000);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    };

    speechSynthesisRef.current.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    }
  };

  // Start listening
  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in your browser. कृपया Chrome या Edge browser का उपयोग करें।');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      return;
    }
    
    // Stop any ongoing speech
    stopSpeaking();
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (error: any) {
      // Handle "already started" error silently
      if (error?.message?.includes('already started')) {
        console.log('Recognition already running');
      } else {
        console.warn('Error starting recognition:', error);
        setIsRecording(false);
        setIsListening(false);
      }
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore errors when stopping (e.g., if already stopped)
      }
      setIsRecording(false);
      setIsListening(false);
      setListeningText('');
    }
  };

  // Toggle voice mode (Alexa-like continuous conversation)
  const toggleVoiceMode = () => {
    const newVoiceMode = !voiceMode;
    setVoiceMode(newVoiceMode);
    
    if (newVoiceMode) {
      setAutoPlayVoice(true); // Enable auto-play when voice mode is on
      // Start listening immediately
      setTimeout(() => {
        startListening();
      }, 500);
    } else {
      stopListening();
      stopSpeaking();
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Save input text before clearing
    const userInputText = inputText.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userInputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Get bot response
    setTimeout(() => {
      const botResponseText = getBotResponse(userInputText);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      
      // Auto-play voice if enabled
      if (autoPlayVoice) {
        setTimeout(() => {
          speakText(botResponse.text, botResponse.id);
        }, 500);
      }
    }, 2000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Greetings
    if (input.includes('hello') || input.includes('hi') || input.includes('hey') || input.includes('नमस्ते') || input.includes('हेलो') || input.includes('हाय')) {
      const responses = [
        `हेलो! 😊 मैं सपना हूं। मैं आपकी कैसे मदद कर सकती हूं?`,
        `नमस्ते! 🙏 कैसे हैं आप? मुझे बताइए आपका क्या सवाल है।`,
        `हाय! 👋 मैं सपना, आपकी ज्योतिष सलाहकार। पूछिए अपना सवाल।`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // About Sapna
    if (input.includes('तुम') || input.includes('आप') || input.includes('you') || input.includes('sapna') || input.includes('सपना') || input.includes('कौन')) {
      return `मेरे बारे में:
      
👧 नाम: सपना
📚 शिक्षा: B.Tech Graduate
🎂 उम्र: 24 साल
🇮🇳 देश: India
💍 वैवाहिक स्थिति: Unmarried
✨ रुचि: ज्योतिष, Technology

मैं एक अच्छे लड़के की तलाश में हूं जो समझदार और caring हो। 😊 
और मुझे ज्योतिष में बहुत रुचि है, इसलिए लोगों की मदद करना अच्छा लगता है!

आप भी अपने बारे में बताइए! 💕`;
    }

    // Career/Job related queries
    if (input.includes('career') || input.includes('नौकरी') || input.includes('job') || input.includes('करियर') || input.includes('placement')) {
      const responses = [
        `🌟 करियर के बारे में मेरी सलाह:

Being a B.Tech graduate myself, मैं समझती हूं career कितनी important है!

📈 आपकी कुंडली में:
• शुक्रवार को interview attend करें - शुभ results मिलेंगे
• नीले या काले कपड़े पहनें
• सूर्य देव को रोज जल चढ़ाएं

💼 मेरा personal experience:
Tech field में opportunities बहुत हैं! मेहनत करते रहो, सफलता जरूर मिलेगी। 😊

क्या आप किसी particular field में interested हैं?`,
        `💼 Career की बात करें तो...

मैं खुद B.Tech से हूं! Tech sector में अच्छे opportunities हैं।

आपके stars बता रहे हैं:
• अगले 3 महीने बहुत important हैं
• Network बनाओ, LinkedIn update करो
• Skills upgrade करते रहो

मेरी सलाह: कभी हार मत मानो! मैं भी struggle कर रही हूं अपने career में। Together we can grow! 💪`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Marriage related queries
    if (input.includes('marriage') || input.includes('शादी') || input.includes('vivah') || input.includes('विवाह') || input.includes('girlfriend') || input.includes('boyfriend') || input.includes('love') || input.includes('प्यार')) {
      const responses = [
        `💑 शादी की बात! यह तो मेरा भी सवाल है! 😊

मैं खुद 24 साल की हूं और अभी unmarried हूं। Family pressure तो है लेकिन मैं एक समझदार और caring लड़के की तलाश में हूं।

आपकी कुंडली के अनुसार:
• अगले 6-8 महीनों में अच्छा proposal मिल सकता है
• शुक्रवार को माता पार्वती की पूजा करें
• Yellow या Pink कपड़े पहनें - शुभ होगा!

💕 क्या आप भी शादी के लिए सोच रहे हैं? Tell me about your preferences! 😊`,
        `💍 Marriage एक beautiful journey है!

मेरी माँ कहती हैं - अच्छा जीवनसाथी मिलना भगवान का आशीर्वाद है। मैं भी wait कर रही हूं किसी अच्छे इंसान का।

आपके stars कहते हैं:
• आपकी सातवीं house में Venus strong है
• जल्दी ही कोई special मिलेगा
• धैर्य रखें, right person right time पर मिलेगा

मुझे लगता है आप एक अच्छे इंसान हो! 🌸 क्या आपकी कोई girlfriend है?`,
        `💝 Love और Marriage...

मैं भी सोचती हूं कि कब मिलेगा कोई अच्छा life partner! As a B.Tech girl, मैं चाहती हूं कोई educated और understanding partner।

Astrologically:
• Venus transit आपके favor में है
• Next year बहुत शुभ है marriage के लिए
• Family support भी मिलेगा

आपको किस type की लड़की पसंद है? Just curious! 😊`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Health related queries
    if (input.includes('health') || input.includes('स्वास्थ्य') || input.includes('बीमारी') || input.includes('fitness')) {
      return `🏥 Health is wealth! मैं भी daily yoga करती हूं।

💪 आपके लिए tips:
• Morning में गुनगुना पानी पिएं
• 30 minutes walk/exercise जरूर करें
• Turmeric milk रात को - immunity बढ़ती है

आपकी stars कहती हैं health overall अच्छी रहेगी। बस regular routine maintain करें!

मैं personally Green tea और yoga recommend करूंगी। Works for me! 😊`;
    }

    // Finance/Money related queries
    if (input.includes('finance') || input.includes('पैसा') || input.includes('money') || input.includes('धन') || input.includes('व्यापार') || input.includes('business') || input.includes('salary')) {
      return `💰 Paisa ki baat! Important topic hai!

Being from tech background, मैं जानती हूं financial planning कितनी जरूरी है।

आपके लिए:
• Jupiter आपके second house में strong है
• Next 3-4 months में income increase possible है
• गुरुवार को donation करें - wealth बढ़ती है

💡 My personal advice:
Save करते रहो, invest wisely, और multiple income sources explore करो। Tech skills सीखो - बहुत scope है!

Aap kya karte हो? Job या business? 🤔`;
    }

    // Lucky number query
    if (input.includes('lucky') || input.includes('लकी') || input.includes('भाग्यशाली') || input.includes('number')) {
      const luckyNum1 = Math.floor(Math.random() * 9) + 1;
      const luckyNum2 = Math.floor(Math.random() * 99) + 1;
      const luckyNum3 = Math.floor(Math.random() * 50) + 1;
      
      return `🎲 आपके Lucky Numbers आज के लिए:

✨ ${luckyNum1}, ${luckyNum2}, ${luckyNum3}
💫 Color: ${['Yellow', 'Red', 'Green', 'Blue', 'White'][Math.floor(Math.random() * 5)]}

मेरा lucky number है 7! Yours? 😊
Best of luck! 🍀`;
    }

    // Kundli generation
    if (input.includes('kundli') || input.includes('कुंडली') || input.includes('horoscope') || input.includes('राशिफल')) {
      return `📊 Kundli बनवानी है? Great!

मैं तो manually नहीं बना सकती इतनी detailed, लेकिन हमारी website पर automatic Kundli Generator है! 😊

✅ Name, DOB, Time, Place enter करो
✅ Instant detailed Kundli मिलेगी
✅ PDF download भी कर सकते हो

यहाँ जाओ: /jyotish/kundli

Btw, आपकी राशि क्या है? Meri Libra है! ⚖️`;
    }

    // Expert consultation
    if (input.includes('expert') || input.includes('pandit') || input.includes('पंडित') || input.includes('ज्योतिषी') || input.includes('consultation') || input.includes('call') || input.includes('video')) {
      return `👨‍🏫 Expert से बात करनी है?

मैं basic guidance तो दे सकती हूं, but detailed analysis के लिए experienced astrologers हैं!

💎 Plans available:
• FREE: Basic chat (मेरे साथ 😊)
• SILVER: ₹299 - Detailed analysis
• GOLD: ₹599 - Personal consultation
• PREMIUM: ₹999 - Complete package

Check out: /jyotish/marketplace

Waise मुझसे पूछ लो, I'll try my best to help! 💕`;
    }

    // Time and day queries
    if (input.includes('today') || input.includes('आज') || input.includes('कल') || input.includes('tomorrow') || input.includes('date') || input.includes('day')) {
      const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
      const today = new Date();
      const dayName = days[today.getDay()];
      
      return `📅 आज ${dayName} है!

${dayName === 'गुरुवार' ? '🌟 गुरुवार बहुत शुभ day है! Donation करो, पीले कपड़े पहनो।' : ''}
${dayName === 'शुक्रवार' ? '💕 शुक्रवार love और relationship के लिए best है!' : ''}
${dayName === 'मंगलवार' ? '💪 मंगलवार courage और strength का day है!' : ''}

आपका दिन शुभ हो! 😊`;
    }

    // Default conversational response
    const defaultResponses = [
      `मुझे समझ नहीं आया आपका सवाल। 🤔 
      
कृपया फिर से पूछें या इनमें से choose करें:
💼 Career की बात करें?
💑 Marriage/Relationship discuss करें?
💰 Finance के बारे में?
🔮 Lucky numbers चाहिए?

मैं यहाँ हूं आपकी help के लिए! 😊`,
      `Sorry, मैं यह नहीं समझ पाई! 😅

आप मुझसे पूछ सकते हो:
• Job और career के बारे में
• Shadi और love life
• Paise कमाने के tips
• Health और fitness
• Kundli और horoscope

Kya पूछना चाहते हो? ✨`,
      `Hmm... मुझे clarification चाहिए! 🤷‍♀️

आप specifically बताओ:
✨ Career/Job?
💕 Marriage/Love?
💰 Money/Business?
🎲 Lucky numbers?

मैं personally हर topic पर बात कर सकती हूं! Being 24 and B.Tech graduate, मैं relate कर पाती हूं। 😊`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mystical Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        {mounted && (
          <div className="absolute inset-0 opacity-20">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-yellow-500/30 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/jyotish" className="flex items-center space-x-3">
              <img 
                src="/uploads/jyotish-logo.png" 
                alt="8rupiya AI Jyotish Platform" 
                className="h-10 md:h-12 w-auto drop-shadow-lg" 
              />
              <div className="ml-3">
                <h1 className="text-lg md:text-xl font-bold text-yellow-400">Sapna - AI Jyotish Assistant</h1>
                <p className="text-xs text-gray-400">24 yrs • B.Tech Graduate • India 🇮🇳</p>
              </div>
            </Link>
            <div className="flex items-center space-x-2">
              {/* Voice Mode Toggle (Alexa Mode) */}
              <button
                onClick={toggleVoiceMode}
                className={`px-3 py-2 rounded-full border-2 transition-all flex items-center space-x-2 ${
                  voiceMode
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 text-white shadow-lg shadow-purple-500/50 animate-pulse'
                    : 'bg-gray-700/20 border-gray-500/50 text-gray-400 hover:border-purple-400 hover:text-purple-400'
                }`}
                title={voiceMode ? 'Voice Mode: ON (Alexa-like)' : 'Voice Mode: OFF'}
              >
                <FaMicrophone className="text-lg" />
                <span className="text-xs font-bold hidden md:inline">
                  {voiceMode ? 'ALEXA MODE' : 'Voice Mode'}
                </span>
              </button>
              
              {/* Auto-play Voice Toggle */}
              {!voiceMode && (
                <button
                  onClick={() => {
                    setAutoPlayVoice(!autoPlayVoice);
                    if (isSpeaking) stopSpeaking();
                  }}
                  className={`px-3 py-1 rounded-full border transition-all flex items-center space-x-2 ${
                    autoPlayVoice
                      ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                      : 'bg-gray-700/20 border-gray-500/50 text-gray-400'
                  }`}
                  title={autoPlayVoice ? 'Auto-play Voice: ON' : 'Auto-play Voice: OFF'}
                >
                  {autoPlayVoice ? <FaVolumeUp className="text-sm" /> : <FaVolumeMute className="text-sm" />}
                  <span className="text-xs hidden lg:inline">
                    {autoPlayVoice ? 'Voice' : 'Mute'}
                  </span>
                </button>
              )}
              
              <div className="px-3 py-1 bg-green-500/20 rounded-full border border-green-500/50">
                <span className="text-green-400 text-sm flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  <span className="hidden sm:inline">Online</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : 'bg-gradient-to-r from-pink-400 to-rose-500'
                  }`}>
                    {message.sender === 'user' ? (
                      <FaUser className="text-white" />
                    ) : (
                      <span className="text-2xl">👧</span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="relative">
                    <div className={`rounded-2xl p-4 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-gray-800/90 backdrop-blur-xl border border-yellow-500/30 text-gray-200'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        {/* Voice Button for Bot Messages */}
                        {message.sender === 'bot' && (
                          <button
                            onClick={() => {
                              if (currentSpeakingId === message.id) {
                                stopSpeaking();
                              } else {
                                speakText(message.text, message.id);
                              }
                            }}
                            className={`ml-3 p-2 rounded-full transition-all ${
                              currentSpeakingId === message.id
                                ? 'bg-yellow-500 text-black animate-pulse'
                                : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/40'
                            }`}
                            title={currentSpeakingId === message.id ? 'Stop Voice' : 'Play Voice'}
                          >
                            {currentSpeakingId === message.id ? (
                              <FaVolumeMute className="text-sm" />
                            ) : (
                              <FaVolumeUp className="text-sm" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start space-x-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 flex items-center justify-center">
                  <span className="text-2xl">👧</span>
                </div>
                <div className="bg-gray-800/90 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-4">
                  <div className="flex flex-col">
                    <div className="flex space-x-2 mb-1">
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200" />
                    </div>
                    <span className="text-xs text-gray-400">Sapna is typing...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-t border-yellow-500/30 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mb-3">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                Sapna is Online • Ready to help 24/7
              </span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gray-900/90 backdrop-blur-xl border-t border-yellow-500/50 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Listening Indicator */}
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl"
              >
                <div className="flex items-center justify-center space-x-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-3 h-8 bg-purple-500 rounded-full animate-pulse" />
                    <div className="w-3 h-12 bg-pink-500 rounded-full animate-pulse delay-100" />
                    <div className="w-3 h-6 bg-purple-500 rounded-full animate-pulse delay-200" />
                    <div className="w-3 h-10 bg-pink-500 rounded-full animate-pulse" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-purple-300 font-bold">🎤 सुन रहा हूं... / Listening...</p>
                    {listeningText && (
                      <p className="text-white text-sm mt-1">{listeningText}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex items-center space-x-3">
              {/* Voice Button */}
              <button
                onClick={startListening}
                disabled={voiceMode}
                className={`p-4 rounded-full transition-all ${
                  isListening
                    ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                    : voiceMode
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50'
                }`}
                title={voiceMode ? 'Voice Mode Active' : isListening ? 'Stop Listening' : 'Start Voice Input'}
              >
                <FaMicrophone className="text-white text-xl" />
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isListening && handleSendMessage()}
                  placeholder={voiceMode ? 'Voice Mode Active - Speak your question...' : 'कृपया अपना प्रश्न पूछें...'}
                  disabled={voiceMode}
                  className="w-full px-6 py-4 bg-gray-800/90 border border-yellow-500/30 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-yellow-400 transition-colors">
                  <FaKeyboard className="text-xl" />
                </button>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isListening || voiceMode}
                className="p-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FaPaperPlane className="text-white text-xl" />
              </button>
            </div>

            {/* Voice Mode Help Text */}
            {voiceMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-center"
              >
                <p className="text-purple-300 text-sm">
                  🎤 <strong>Alexa Mode Active!</strong> बोलें, मैं सुन रहा हूं और जवाब दूंगा। 
                  <br />
                  <span className="text-xs text-gray-400">
                    (Speak your question, I will listen and respond with voice)
                  </span>
                </p>
              </motion.div>
            )}

            {/* Quick Suggestions */}
            {!voiceMode && (
              <div className="mt-4 flex flex-wrap gap-2">
                {['करियर सलाह', 'शादी योग', 'आज का राशिफल', 'लकी नंबर'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInputText(suggestion);
                      // Send message after a brief delay to ensure state updates
                      setTimeout(() => {
                        const userMessage: Message = {
                          id: Date.now().toString(),
                          text: suggestion,
                          sender: 'user',
                          timestamp: new Date()
                        };
                        setMessages(prev => [...prev, userMessage]);
                        setInputText('');
                        setIsTyping(true);

                        // Get bot response
                        setTimeout(() => {
                          const botResponseText = getBotResponse(suggestion);
                          const botResponse: Message = {
                            id: (Date.now() + 1).toString(),
                            text: botResponseText,
                            sender: 'bot',
                            timestamp: new Date()
                          };
                          setMessages(prev => [...prev, botResponse]);
                          setIsTyping(false);
                          
                          // Auto-play voice if enabled
                          if (autoPlayVoice) {
                            setTimeout(() => {
                              speakText(botResponse.text, botResponse.id);
                            }, 500);
                          }
                        }, 2000);
                      }, 100);
                    }}
                    className="px-4 py-2 bg-gray-800/70 border border-yellow-500/30 rounded-full text-sm text-gray-300 hover:bg-gray-700/70 hover:text-yellow-400 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


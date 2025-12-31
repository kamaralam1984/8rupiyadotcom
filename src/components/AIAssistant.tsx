'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaKeyboard, FaTimes, FaRobot, FaPhone, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import Image from 'next/image';

const BOT_IMAGE_PATH = '/uploads/bot screen.png';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ShopRecommendation {
  _id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  phone?: string;
  rating: number;
  reviewCount: number;
  distance?: number;
  distanceText?: string;
  timeText?: string;
  isPaid: boolean;
  reason: string;
  images?: string[];
}

interface AIAssistantProps {
  userLocation?: { lat: number; lng: number } | null;
  userId?: string;
}

export default function AIAssistant({ userLocation, userId }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Namaste! 🙏 Main Golu hoon, 8rupiya ki AI assistant. Main aapko nearby shops aur services dhundhne me madad karti hoon. Aapko kya chahiye? 😊',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [listeningText, setListeningText] = useState('');
  const [finalTranscript, setFinalTranscript] = useState(''); // Store final transcript separately
  const [recommendations, setRecommendations] = useState<ShopRecommendation[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  
  // Reminder system states
  const [dueReminders, setDueReminders] = useState<any[]>([]);
  const [showReminders, setShowReminders] = useState(false);
  
  // Dragging state - use null to indicate default position (bottom-right)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const capturedTranscriptRef = useRef<string>(''); // Store transcript in ref for onend callback

  // Generate session ID on mount
  useEffect(() => {
    setMounted(true);
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(id);
    // Position will be null initially, which means use default bottom-right positioning
    
    // Check for due reminders every minute
    const reminderInterval = setInterval(checkDueReminders, 60000);
    checkDueReminders(); // Check immediately
    
    return () => clearInterval(reminderInterval);
  }, []);

  // Handle window resize to keep bot in bounds
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && position !== null) {
        const buttonSize = 64;
        const padding = 20;
        setPosition(prev => {
          if (!prev) return null;
          // Keep within bounds
          return {
            x: Math.max(buttonSize / 2 + padding, Math.min(prev.x, window.innerWidth - buttonSize / 2 - padding)),
            y: Math.max(buttonSize / 2 + padding, Math.min(prev.y, window.innerHeight - buttonSize / 2 - padding))
          };
        });
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [position]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    const target = e.target as HTMLElement;
    // Don't drag if clicking on buttons or input fields
    if (target.closest('button') || target.closest('input') || target.closest('textarea')) {
      return;
    }
    setHasDragged(false);
    setIsDragging(true);
    
    // Initialize position if it's null (first drag)
    if (position === null && typeof window !== 'undefined') {
      const buttonSize = 64;
      const padding = 20;
      const initialPos = {
        x: window.innerWidth - (buttonSize / 2) - padding,
        y: window.innerHeight - (buttonSize / 2) - padding
      };
      setPosition(initialPos);
      setDragStart({
        x: e.clientX - initialPos.x,
        y: e.clientY - initialPos.y
      });
    } else if (position !== null) {
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    }
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const target = e.target as HTMLElement;
    // Don't drag if clicking on buttons or input fields
    if (target.closest('button') || target.closest('input') || target.closest('textarea')) {
      return;
    }
    setHasDragged(false);
    setIsDragging(true);
    
    // Initialize position if it's null (first drag)
    if (position === null && typeof window !== 'undefined') {
      const buttonSize = 64;
      const padding = 20;
      const initialPos = {
        x: window.innerWidth - (buttonSize / 2) - padding,
        y: window.innerHeight - (buttonSize / 2) - padding
      };
      setPosition(initialPos);
      setDragStart({
        x: e.touches[0].clientX - initialPos.x,
        y: e.touches[0].clientY - initialPos.y
      });
    } else if (position !== null) {
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    });
    }
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || position === null) return;
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Check if actually moved (more than 5px)
      const moved = Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5;
      if (moved) {
        setHasDragged(true);
      }
      
      // Keep within bounds
      const buttonSize = 64;
      const padding = 20;
      const maxX = typeof window !== 'undefined' ? window.innerWidth - buttonSize / 2 - padding : 0;
      const maxY = typeof window !== 'undefined' ? window.innerHeight - buttonSize / 2 - padding : 0;
      
      setPosition({
        x: Math.max(buttonSize / 2 + padding, Math.min(newX, maxX)),
        y: Math.max(buttonSize / 2 + padding, Math.min(newY, maxY))
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1 || position === null) return;
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      
      // Check if actually moved (more than 5px)
      const moved = Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5;
      if (moved) {
        setHasDragged(true);
      }
      
      // Keep within bounds
      const buttonSize = 64;
      const padding = 20;
      const maxX = typeof window !== 'undefined' ? window.innerWidth - buttonSize / 2 - padding : 0;
      const maxY = typeof window !== 'undefined' ? window.innerHeight - buttonSize / 2 - padding : 0;
      
      setPosition({
        x: Math.max(buttonSize / 2 + padding, Math.min(newX, maxX)),
        y: Math.max(buttonSize / 2 + padding, Math.min(newY, maxY))
      });
      e.preventDefault();
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart, position]);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition && !recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'hi-IN'; // Hindi with fallback to English
        
        recognition.onstart = () => {
          setIsListening(true);
          setListeningText('');
          setFinalTranscript('');
          capturedTranscriptRef.current = ''; // Reset captured transcript
          console.log('Speech recognition started');
        };
        
        recognition.onresult = (event: any) => {
          // Get all results (both interim and final)
          const results = Array.from(event.results);
          let interimTranscript = '';
          let finalTranscriptText = '';
          
          for (let i = 0; i < results.length; i++) {
            const result = (results[i] as any)[0];
            if (result.isFinal) {
              finalTranscriptText += result.transcript + ' ';
            } else {
              interimTranscript += result.transcript;
            }
          }
          
          // Show interim results
          if (interimTranscript) {
            setListeningText(interimTranscript);
          }
          
          // Store final transcript in both state and ref
          if (finalTranscriptText.trim()) {
            const finalText = finalTranscriptText.trim();
            capturedTranscriptRef.current = finalText; // Store in ref for onend callback
            setFinalTranscript(finalText);
            setInputText(finalText);
            setListeningText(finalText); // Show final text
            console.log('Final transcript captured:', finalText);
          } else if (interimTranscript) {
            // Also store interim in ref as fallback
            capturedTranscriptRef.current = interimTranscript;
          }
        };
        
        recognition.onerror = (event: any) => {
          const errorType = event.error;
          console.log('Speech recognition error:', errorType);
          if (!['aborted', 'no-speech'].includes(errorType)) {
            console.warn('Speech recognition error:', errorType);
          }
          setIsListening(false);
          setIsRecording(false);
          // Don't clear text on error, keep what was captured
        };
        
        recognition.onend = () => {
          console.log('Speech recognition ended, captured text:', capturedTranscriptRef.current);
          setIsListening(false);
          setIsRecording(false);
          
          // Use ref value which is always up-to-date
          const textToSend = capturedTranscriptRef.current.trim() || listeningText.trim() || inputText.trim();
          console.log('Text to send:', textToSend);
          
          if (textToSend) {
            setInputText(textToSend);
            setListeningText('');
            setFinalTranscript('');
            capturedTranscriptRef.current = '';
            // Small delay to ensure state is updated, then auto-send
            setTimeout(() => {
              console.log('Auto-sending message:', textToSend);
              handleSendMessage(textToSend);
            }, 300);
          } else {
            setListeningText('');
            setFinalTranscript('');
            capturedTranscriptRef.current = '';
            console.log('No text captured, not sending');
          }
        };
        
        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speak text
  const speakText = (text: string) => {
    if (!speechSynthesisRef.current) return;

    speechSynthesisRef.current.cancel();

    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#+\s/g, '')
      .replace(/•/g, '')
      .replace(/[📈💫🎯💑✨🌸💰💵🏥🌿👨‍👩‍👧‍👦🙏🌟⭐]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    const voices = speechSynthesisRef.current.getVoices();
    const hindiVoice = voices.find(voice => 
      voice.lang.includes('hi') || voice.name.includes('Hindi')
    );
    
    if (hindiVoice) {
      utterance.voice = hindiVoice;
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported. Please use Chrome or Edge browser.');
      return;
    }
    
    // Don't start if already listening
    if (isListening || isRecording) {
      return;
    }
    
    stopSpeaking();
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (error: any) {
      if (!error?.message?.includes('already started')) {
        console.warn('Error starting recognition:', error);
        setIsRecording(false);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Stopped speech recognition manually');
      } catch (error) {
        console.warn('Error stopping recognition:', error);
      }
      setIsRecording(false);
      setIsListening(false);
      
      // Use ref value which is always up-to-date
      const textToSend = capturedTranscriptRef.current.trim() || listeningText.trim() || inputText.trim();
      console.log('Manual stop - text to send:', textToSend);
      
      if (textToSend) {
        setInputText(textToSend);
      setListeningText('');
        setFinalTranscript('');
        capturedTranscriptRef.current = '';
        // Small delay to ensure state is updated, then send
        setTimeout(() => {
          console.log('Auto-sending message after manual stop:', textToSend);
          handleSendMessage(textToSend);
        }, 300);
      } else {
        setListeningText('');
        setFinalTranscript('');
        capturedTranscriptRef.current = '';
      }
    }
  };

  // Check for due reminders
  const checkDueReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/golu/reminders/check', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.reminders && data.reminders.length > 0) {
          setDueReminders(data.reminders);
          setShowReminders(true);

          // Speak the first reminder
          const reminder = data.reminders[0];
          speakText(reminder.message);

          // Mark as notified
          await fetch('/api/golu/reminders/check', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              reminderId: reminder._id,
              action: 'notified',
            }),
          });
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride || inputText).trim();
    if (!textToSend) return;

    const userInputText = textToSend;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userInputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setRecommendations([]);

    try {
      const token = localStorage.getItem('token');
      
      // First try GOLU chat API for advanced features (reminders, translation, etc.)
      const goluResponse = await fetch('/api/golu/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          query: userInputText,
          sessionId,
          type: 'TEXT',
          userLocation: userLocation ? { latitude: userLocation.lat, longitude: userLocation.lng } : null,
        }),
      });

      const goluData = await goluResponse.json();

      // If GOLU returned MEDIA category with YouTube embed, handle it
      if (goluData.success && goluData.category === 'MEDIA' && goluData.metadata?.embedUrl) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: goluData.response + '\n\n[YOUTUBE_PLAYER:' + goluData.metadata.embedUrl + ']',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
        speakText(goluData.response);
        setIsTyping(false);
        return;
      }

      // If GOLU handled it (reminders, alarms, translation, etc.), use that response
      if (goluData.success && goluData.category && goluData.category !== 'SHOPPING') {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: goluData.response,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
        speakText(goluData.response);
        setIsTyping(false);
        return;
      }

      // If GOLU returned SHOPPING category with shop results, use those
      if (goluData.success && goluData.category === 'SHOPPING' && goluData.metadata?.shopResults) {
        const shopResults = goluData.metadata.shopResults;
        
        // Convert GOLU shop results to ShopRecommendation format
        const recommendations: ShopRecommendation[] = shopResults.map((shop: any) => ({
          _id: shop._id,
          name: shop.name,
          category: shop.category,
          address: shop.address,
          city: shop.city,
          phone: shop.phone,
          distance: shop.distance,
          rating: shop.rating || 0,
          reviewCount: shop.reviewCount || 0,
        }));

        setRecommendations(recommendations);
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: goluData.response,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
        speakText(goluData.response);
        setIsTyping(false);
        return;
      }

      // Otherwise, use shop recommendation API
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userInputText,
          lat: userLocation?.lat,
          lng: userLocation?.lng,
          sessionId,
          userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Only set recommendations if it's not a personal question
        if (!data.isPersonal && data.recommendations) {
          setRecommendations(data.recommendations);
        } else {
          setRecommendations([]);
        }
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
        speakText(data.response);
      } else {
        // Use the response from API (which should have the proper message)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || 'Is area ka data abhi update ho raha hai, thodi der me available ho jayega. Kripya thodi der baad try karein.',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        if (data.response) {
          speakText(data.response);
        }
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Is area ka data abhi update ho raha hai, thodi der me available ho jayega. Kripya thodi der baad try karein ya koi aur service puchhein.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      speakText(errorMessage.text);
    } finally {
      setIsTyping(false);
    }
  };

  const trackInteraction = async (shopId: string, type: 'click' | 'call' | 'whatsapp') => {
    try {
      await fetch('/api/ai/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          shopId,
          interactionType: type,
          userId,
        }),
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const handleShopClick = (shop: ShopRecommendation) => {
    trackInteraction(shop._id, 'click');
    window.open(`/shops/${shop._id}`, '_blank');
  };

  const handleCall = (shop: ShopRecommendation) => {
    if (shop.phone) {
      trackInteraction(shop._id, 'call');
      window.location.href = `tel:${shop.phone}`;
    }
  };

  const handleWhatsApp = (shop: ShopRecommendation) => {
    if (shop.phone) {
      trackInteraction(shop._id, 'whatsapp');
      const phoneNumber = shop.phone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${phoneNumber}`, '_blank');
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.div
          ref={dragRef}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          style={{
            position: 'fixed',
            // Default to bottom-right if position is null (not dragged yet)
            ...(position === null ? {
              right: '20px',
              bottom: '20px',
            } : {
              // After dragging, use absolute positioning with transform
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -50%)',
            }),
            zIndex: 50,
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="select-none"
        >
          <motion.button
            whileHover={{ scale: isDragging ? 1 : 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              // Only open if we didn't just drag
              if (!hasDragged && !isDragging) {
                setIsOpen(true);
              }
            }}
            onMouseUp={(e) => {
              // Reset hasDragged after a short delay
              setTimeout(() => {
                setHasDragged(false);
              }, 100);
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-full p-0 shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center overflow-hidden"
            aria-label="Open AI Assistant"
          >
            <Image
              src={BOT_IMAGE_PATH}
              alt="8Rupiya AI"
              width={64}
              height={64}
              className="w-16 h-16 object-cover rounded-full pointer-events-none"
              priority
              unoptimized
            />
          </motion.button>
        </motion.div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dragRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              ...(position === null ? {
                // Default to bottom-right if not dragged
                right: '20px',
                bottom: '20px',
                transform: 'none',
              } : {
                // Use dragged position
              left: `${position.x}px`,
              top: isMinimized 
                ? `${position.y}px` 
                : `${Math.min(position.y, typeof window !== 'undefined' ? window.innerHeight - 320 : position.y)}px`,
              transform: 'translate(-50%, -50%)',
              }),
              zIndex: 50,
              width: isMinimized ? '320px' : '384px',
              height: isMinimized ? '64px' : '600px',
              maxWidth: 'calc(100vw - 20px)',
              maxHeight: 'calc(100vh - 20px)',
            }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 select-none"
          >
            {/* Header - Draggable area */}
            <div 
              className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{ 
                cursor: isDragging ? 'grabbing' : 'grab', 
                touchAction: 'none',
                userSelect: 'none'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
                  <Image
                    src={BOT_IMAGE_PATH}
                    alt="8Rupiya AI"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <h3 className="font-semibold">Golu</h3>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors cursor-pointer"
                  aria-label={isMinimized ? 'Expand' : 'Minimize'}
                >
                  <span className="text-sm">{isMinimized ? '□' : '_'}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    setIsMinimized(false);
                    stopSpeaking();
                    stopListening();
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender === 'bot' && (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                          <Image
                            src={BOT_IMAGE_PATH}
                            alt="8Rupiya AI"
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {/* Check if message contains YouTube player */}
                        {message.text.includes('[YOUTUBE_PLAYER:') ? (
                          <>
                            <p className="text-sm whitespace-pre-wrap mb-3">
                              {message.text.split('[YOUTUBE_PLAYER:')[0]}
                            </p>
                            <div className="rounded-lg overflow-hidden">
                              <iframe
                                width="100%"
                                height="200"
                                src={message.text.split('[YOUTUBE_PLAYER:')[1].split(']')[0]}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="rounded-lg"
                              ></iframe>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-start gap-2 justify-start">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                        <Image
                          src={BOT_IMAGE_PATH}
                          alt="8Rupiya AI"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <div className="space-y-3 mt-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Recommended Shops:</p>
                      {recommendations.map((shop) => (
                        <motion.div
                          key={shop._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{shop.name}</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{shop.category}</p>
                              {shop.distanceText && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
                                  <FaMapMarkerAlt /> {shop.distanceText} • {shop.timeText}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-yellow-500">⭐ {shop.rating.toFixed(1)}</span>
                                {shop.isPaid && (
                                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {shop.phone && (
                              <>
                                <button
                                  onClick={() => handleCall(shop)}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors"
                                >
                                  <FaPhone /> Call
                                </button>
                                <button
                                  onClick={() => handleWhatsApp(shop)}
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors"
                                >
                                  <FaWhatsapp /> WhatsApp
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleShopClick(shop)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  {listeningText && (
                    <div className="mb-2 text-xs text-gray-500 italic">Listening: {listeningText}</div>
                  )}
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type or speak your query..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                    />
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isListening && !isRecording) {
                        startListening();
                        }
                      }}
                      onMouseUp={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isListening || isRecording) {
                          stopListening();
                        }
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isListening && !isRecording) {
                          startListening();
                        }
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isListening || isRecording) {
                          stopListening();
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isRecording || isListening
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      aria-label="Voice input"
                      type="button"
                    >
                      <FaMicrophone />
                    </button>
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim() || isTyping}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Send message"
                    >
                      <FiSend />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {isSpeaking ? '🔊 Speaking...' : isListening ? '🎤 Listening...' : 'Press mic to speak'}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


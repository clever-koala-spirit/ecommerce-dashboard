import { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

const STORAGE_KEY = 'slay_ai_visitor';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [onboardingStep, setOnboardingStep] = useState('chat'); // 'name' | 'email' | 'chat'
  const [needsHuman, setNeedsHuman] = useState(false);

  // Load visitor info from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.name) {
        setVisitorName(saved.name);
        setOnboardingStep('chat');
      }
      if (saved.email) setVisitorEmail(saved.email);
    } catch (e) { /* ignore */ }

    // Fallback: try JWT token
    try {
      const token = localStorage.getItem('ss_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.name) { setVisitorName(payload.name); setOnboardingStep('chat'); }
        if (payload.email) setVisitorEmail(payload.email);
      }
    } catch (e) { /* not logged in */ }
  }, []);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  // Welcome flow when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.name) {
        // Returning visitor
        setMessages([{
          id: '1',
          text: `Welcome back, ${saved.name}! 🎉 How can I help you today?`,
          sender: 'ai',
          timestamp: new Date().toISOString()
        }]);
        setOnboardingStep('chat');
      } else {
        // New visitor — ask for name
        setMessages([{
          id: '1',
          text: "Hey! I'm Slay AI 👋 What's your name?",
          sender: 'ai',
          timestamp: new Date().toISOString()
        }]);
        setOnboardingStep('name');
      }
    }
  }, [isOpen]);

  const saveVisitor = (name, email) => {
    const data = { name, email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const handleOnboardingSubmit = () => {
    const val = inputValue.trim();
    if (!val) return;

    if (onboardingStep === 'name') {
      setVisitorName(val);
      saveVisitor(val, visitorEmail);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), text: val, sender: 'user', timestamp: new Date().toISOString() },
        { id: (Date.now() + 1).toString(), text: `Nice to meet you, ${val}! 😊 Drop your email so we can follow up if needed (or type "skip"):`, sender: 'ai', timestamp: new Date().toISOString() }
      ]);
      setInputValue('');
      setOnboardingStep('email');
    } else if (onboardingStep === 'email') {
      if (val.toLowerCase() === 'skip') {
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), text: val, sender: 'user', timestamp: new Date().toISOString() },
          { id: (Date.now() + 1).toString(), text: `No worries! How can I help you today?`, sender: 'ai', timestamp: new Date().toISOString() }
        ]);
      } else {
        setVisitorEmail(val);
        saveVisitor(visitorName, val);
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), text: val, sender: 'user', timestamp: new Date().toISOString() },
          { id: (Date.now() + 1).toString(), text: `Got it, thanks ${visitorName}! 🙌 How can I help you today?`, sender: 'ai', timestamp: new Date().toISOString() }
        ]);
      }
      setInputValue('');
      setOnboardingStep('chat');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Handle onboarding flow
    if (onboardingStep !== 'chat') {
      handleOnboardingSubmit();
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue.trim(),
          conversationId,
          visitorEmail: visitorEmail || undefined,
          visitorName: visitorName || undefined
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        needsHuman: data.needsHuman
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationId(data.conversationId);
      if (data.needsHuman) setNeedsHuman(true);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 group"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`bg-gray-900 rounded-lg shadow-2xl border border-gray-700 transition-all duration-300 ${
        isMinimized ? 'w-80 h-14' : 'w-80 h-96'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">Slay AI</h3>
              <p className="text-white/80 text-xs">Online now</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <a
              href="https://wa.me/18303902778"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white text-xs px-2 py-1 rounded border border-white/20 hover:border-white/40 transition-colors"
            >
              WhatsApp
            </a>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        {!isMinimized && (
          <>
            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-900">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : message.isError
                        ? 'bg-red-600/20 text-red-200 border border-red-600/30'
                        : message.isSystem
                        ? 'bg-green-600/20 text-green-200 border border-green-600/30'
                        : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    <p>{message.text}</p>
                    {message.needsHuman && (
                      <p className="text-xs mt-2 opacity-90">
                        I've flagged this for our team. They'll reach out soon.
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    onboardingStep === 'name' ? 'Enter your name...' :
                    onboardingStep === 'email' ? 'Enter email or type "skip"...' :
                    'Type your message...'
                  }
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center mt-2">
                <p className="text-gray-500 text-xs">Powered by Slay AI</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;

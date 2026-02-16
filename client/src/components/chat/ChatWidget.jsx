import { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [visitorEmail, setVisitorEmail] = useState('');
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [needsHuman, setNeedsHuman] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Initialize with welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        text: "Hey! 👋 I'm here to help with anything about Slay Season. Ask me about pricing, features, or getting started.",
        sender: 'ai',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Show email prompt after first message if email not collected
    if (messages.length <= 1 && !visitorEmail && !showEmailPrompt) {
      setTimeout(() => setShowEmailPrompt(true), 1000);
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue.trim(),
          conversationId,
          visitorEmail: visitorEmail || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        needsHuman: data.needsHuman
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationId(data.conversationId);
      
      if (data.needsHuman) {
        setNeedsHuman(true);
        // Show email prompt if not already collected
        if (!visitorEmail) {
          setShowEmailPrompt(true);
        }
      }

    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const submitEmail = () => {
    if (visitorEmail.trim()) {
      setShowEmailPrompt(false);
      const emailMessage = {
        id: Date.now().toString(),
        text: `Thanks! We've got your email: ${visitorEmail}`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isSystem: true
      };
      setMessages(prev => [...prev, emailMessage]);
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
              <h3 className="text-white font-medium text-sm">Slay Season AI</h3>
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
                        I've flagged this for our team. They'll reach out within a few hours. Want to leave your email?
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Email Prompt */}
              {showEmailPrompt && !visitorEmail && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                  <p className="text-gray-200 text-sm mb-2">Want us to follow up? Drop your email:</p>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      onKeyPress={(e) => e.key === 'Enter' && submitEmail()}
                    />
                    <button
                      onClick={submitEmail}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Save
                    </button>
                  </div>
                  <button
                    onClick={() => setShowEmailPrompt(false)}
                    className="text-gray-400 text-xs mt-1 hover:text-gray-300"
                  >
                    Skip for now
                  </button>
                </div>
              )}

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
                  placeholder="Type your message..."
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

              {/* Footer */}
              <div className="flex items-center justify-center mt-2">
                <p className="text-gray-500 text-xs">
                  Powered by Slay Season AI
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
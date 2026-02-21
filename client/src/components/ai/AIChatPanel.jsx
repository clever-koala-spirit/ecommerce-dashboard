import { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, Loader, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

// Simple markdown-to-text converter (no library needed)
function parseMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1') // italic
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // links
    .replace(/`(.*?)`/g, '$1'); // code
}

export default function AIChatPanel() {
  const chatOpen = useStore((s) => s.chatOpen);
  const toggleChat = useStore((s) => s.toggleChat);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'What are my top revenue drivers this month?',
    'Compare performance across channels',
    'Which products have the highest ROAS?',
    'Forecast next quarter revenue',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const shopDomain = sessionStorage.getItem('shopDomain') || localStorage.getItem('ss_shop');
      const token = localStorage.getItem('ss_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(shopDomain && { 'X-Shop-Domain': shopDomain }),
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/ai/chat`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: userMessage.text,
          history: messages,
          filters: {}, // Can pass current filters here
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        text: data.text || 'Unable to generate response',
        sender: 'ai',
        timestamp: new Date(),
        actions: data.actions || [],
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Handle any actions suggested by AI
      if (aiMessage.actions && aiMessage.actions.length > 0) {
        handleAIActions(aiMessage.actions);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[Chat Error]', error);
      }
      const errorMessage = {
        id: Date.now() + 1,
        text: error.message === 'Failed to get AI response'
          ? 'AI service unavailable. Check your API configuration in Settings.'
          : 'An error occurred. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIActions = (actions) => {
    // Handle actions like showChart, highlightMetric, etc.
    actions.forEach((action) => {
      if (import.meta.env.DEV) {
        if (import.meta.env.DEV) {
          console.log('[AI Action]', action);
        }
      }
      // Future: implement action handlers
    });
  };

  const handleSuggestedPrompt = (prompt) => {
    setInput(prompt);
  };

  return (
    <>
      {/* Chat Panel Overlay */}
      {chatOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleChat}
        />
      )}

      {/* Chat Panel */}
      <div
        className={`fixed bottom-0 right-0 top-16 w-96 transform transition-transform duration-300 flex flex-col border-l ${
          chatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'var(--color-bg-primary)',
          borderColor: 'var(--color-border)',
          zIndex: 50,
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h3
              className="font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              AI Assistant
            </h3>
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Powered by Anthropic
            </p>
          </div>
          <button
            onClick={toggleChat}
            className="p-1 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{ background: 'var(--color-bg-secondary)' }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col h-full items-center justify-center text-center">
              <div
                className="text-4xl mb-3"
                style={{ color: 'var(--color-accent)' }}
              >
                ✨
              </div>
              <p
                className="text-sm font-medium mb-4"
                style={{ color: 'var(--color-text-primary)' }}
              >
                How can I help you today?
              </p>

              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 gap-2 w-full">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="text-left text-xs p-2 rounded-lg hover:bg-opacity-50 transition-colors"
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className="max-w-xs px-3 py-2 rounded-lg text-sm break-words"
                    style={{
                      background:
                        message.sender === 'user'
                          ? 'var(--color-accent)'
                          : 'var(--color-bg-card)',
                      color:
                        message.sender === 'user'
                          ? 'white'
                          : 'var(--color-text-primary)',
                      border:
                        message.sender === 'user'
                          ? 'none'
                          : '1px solid var(--color-border)',
                    }}
                  >
                    {parseMarkdown(message.text)}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-2 text-xs opacity-75">
                        {message.actions.map((action, idx) => (
                          <div key={idx}>{action}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="px-3 py-2 rounded-lg"
                    style={{
                      background: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: 'var(--color-accent)' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          background: 'var(--color-accent)',
                          animationDelay: '0.2s',
                        }}
                      />
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          background: 'var(--color-accent)',
                          animationDelay: '0.4s',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div
          className="p-4 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask something..."
              className="flex-1 px-3 py-2 rounded-lg text-sm"
              style={{
                background: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              }}
              disabled={isLoading}
            />

            {/* Voice Input Button */}
            <button
              className="p-2 rounded-lg hover:bg-opacity-50 transition-colors"
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--color-accent)',
              }}
              title="Voice input"
              disabled={isLoading}
            >
              <Mic size={18} />
            </button>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              className="p-2 rounded-lg hover:opacity-80 transition-opacity"
              style={{
                background: 'var(--color-accent)',
                color: 'white',
              }}
              disabled={isLoading || !input.trim()}
              title="Send message"
            >
              {isLoading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

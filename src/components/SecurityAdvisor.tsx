"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function SecurityAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm doing well, thank you.
I’m a Phishing Link Detection Assistant designed to help you identify phishing links, scam websites, and online fraud attempts.
Please share a suspicious link, message, or phishing-related question so I can assist you.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to get response');
      }

      if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error instanceof Error ? error.message : 'Something went wrong'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg z-50 cyber-glow p-0 overflow-hidden border-2 border-primary/50"
      >
        {isOpen ? (
          <X className="text-black w-6 h-6" />
        ) : (
          <Bot className="text-black w-7 h-7 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 md:bottom-28 right-4 left-4 md:left-auto md:right-6 md:w-96 h-[450px] bg-black/95 border border-primary/30 backdrop-blur-2xl rounded-2xl flex flex-col overflow-hidden z-50 shadow-[0_0_50px_rgba(0,255,153,0.1)]"
          >
            {/* Header */}
            <div className="p-3 border-b border-primary/20 bg-primary/10 flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest text-white">SECURITY_ADVISOR</h3>
                <span className="text-[9px] font-mono text-primary uppercase">Neural Link Established</span>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === 'user'
                      ? 'bg-primary/20 border border-primary/30 text-primary-foreground'
                      : 'bg-white/5 border border-white/10 text-muted-foreground'
                    }`}>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-white/5">
                      {msg.role === 'user' ? (
                        <User className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Bot className="w-4 h-4 text-primary" />
                      )}
                      <span className={`text-[9px] font-black uppercase ${msg.role === 'assistant' ? 'text-primary' : ''}`}>{msg.role === 'assistant' ? 'Security Advisor' : msg.role}</span>
                    </div>

                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    <span className="text-[10px] animate-pulse font-mono">PROCESSING_QUERY...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-primary/20">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about a threat..."
                  className="bg-black/40 border-white/10 focus:border-primary text-xs h-10"
                />
                <Button onClick={handleSend} disabled={isLoading} size="icon" className="h-10 w-10 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

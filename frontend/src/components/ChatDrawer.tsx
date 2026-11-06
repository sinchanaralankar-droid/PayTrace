import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles, CornerDownLeft, RotateCcw } from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { ChatMessage, Order } from '../types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: Order | null;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  selectedOrder,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your PayTrace AI Copilot. Ask me anything about your PayPal orders, why an order received HOLD or ASK, or how PayPal fees are handled.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await sendChatMessage(textToSend, selectedOrder?.id);
      const replyText = res.reply || 'No response text received from the assistant. Please try asking again.';
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citedOrders: res.cited_orders || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Sorry, I encountered an issue: ${err.message || 'Connecting to the PayTrace assistant service failed. Please check your backend connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  const currentVerdict = selectedOrder?.latest_verdict && selectedOrder.latest_verdict !== 'UNVERIFIED'
    ? selectedOrder.latest_verdict
    : 'on HOLD';

  const quickQuestions = [
    selectedOrder ? `Why is ${selectedOrder.id} ${currentVerdict}?` : 'Why is ORD-1002 on HOLD?',
    'how many total orders completed',
    'Can I safely ship ORD-1001?',
    'Explain how PayPal fees are handled',
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md h-[550px] bg-pastel-card border border-pastel-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-pastel-border bg-gradient-to-r from-pastel-skyBg via-pastel-card to-pastel-lavenderBg flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#1E60F2] text-white flex items-center justify-center shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-pastel-darkText text-sm">
                PayTrace Copilot
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full font-bold bg-pastel-lavenderBg text-pastel-lavenderText border border-pastel-lavenderBorder">
                Gemini 3.5
              </span>
            </div>
            <p className="text-[11px] text-pastel-subText">
              {selectedOrder ? `Context: ${selectedOrder.id} (${selectedOrder.customer_name})` : 'Ask queries on all 6 orders'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-1.5 rounded-lg text-pastel-muted hover:text-pastel-darkText hover:bg-pastel-bg transition"
            title="Reset Conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-pastel-muted hover:text-pastel-darkText hover:bg-pastel-bg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-pastel-bg/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-pastel-skySolid text-white'
                  : 'bg-[#1E60F2] text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div
              className={`max-w-[82%] p-3 rounded-2xl text-xs space-y-1 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-pastel-skySolid text-white rounded-tr-none'
                  : 'bg-pastel-card border border-pastel-border text-pastel-darkText rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              <div
                className={`text-[9px] text-right ${
                  msg.sender === 'user' ? 'text-sky-100' : 'text-pastel-muted'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-pastel-muted italic pl-9">
            <Sparkles className="h-3.5 w-3.5 text-pastel-lavenderSolid animate-spin" />
            <span>AI Copilot is analyzing payment evidence...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-2 border-t border-pastel-border bg-pastel-card flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] font-bold text-pastel-muted uppercase shrink-0 pl-1">
          Suggestions:
        </span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-pastel-bg hover:bg-slate-200 border border-pastel-border text-pastel-darkText whitespace-nowrap transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-pastel-border bg-pastel-card flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about an order or rule..."
          className="flex-1 px-3.5 py-2 text-xs bg-pastel-bg border border-pastel-border rounded-xl text-pastel-darkText placeholder-pastel-muted focus:outline-none focus:border-pastel-skySolid focus:ring-1 focus:ring-pastel-skySolid transition"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="p-2 rounded-xl bg-pastel-skySolid hover:bg-sky-700 text-white shadow-sm transition disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

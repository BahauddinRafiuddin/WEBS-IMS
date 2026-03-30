/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { X, Sparkles, Send, Loader2 } from "lucide-react";
import { publicChatHandler } from "../../api/publicChat-bot.api"; // Adjust this path to your api file

const AIChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hi! I'm your Internship Assistant. How can I help you today?" }
  ]);

  const scrollRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    // 1. Add user message to UI
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // 2. Call your API handler
      // Sending { message: userMessage } based on standard POST patterns
      const data = await publicChatHandler({ message: userMessage });

      // 3. Add AI reply to UI
      setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { role: "ai", content: "Sorry, I'm having trouble connecting right now. Please try again later." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-9999 flex flex-col items-end font-sans">
      {/* Chat Window */}
      {isChatOpen && (
        <div className="w-[320px] sm:w-96 h-125 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-200" />
              <span className="font-bold tracking-tight">AI Assistant</span>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)} 
              className="hover:bg-indigo-500 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4 scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-indigo-600" />
                  <span className="text-xs text-slate-500">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t border-slate-100 flex gap-2"
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about internships..." 
              className="flex-1 text-sm bg-slate-100 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white p-2 rounded-xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-white cursor-pointer relative group"
      >
        {isChatOpen ? <X size={28} /> : <Sparkles size={28} className="animate-pulse" />}
      </button>
    </div>
  );
};

export default AIChat;
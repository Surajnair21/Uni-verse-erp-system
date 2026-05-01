"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "bot", content: "Hi! I'm your academic assistant. Ask me about your attendance or IA marks!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { id: Date.now().toString(), role: "user", content: userMessage }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await apiFetch<{ reply: string }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMessage })
      });

      setMessages([
        ...newMessages,
        { id: (Date.now() + 1).toString(), role: "bot", content: res.reply }
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        { id: (Date.now() + 1).toString(), role: "bot", content: "Sorry, I couldn't process that right now. Please try again later." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-full text-white shadow-lg shadow-indigo-200/50 flex items-center justify-center z-50 focus:outline-none"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl shadow-indigo-100/50 border border-slate-100 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Uni-Verse AI</div>
                  <div className="text-[10px] text-sky-100 opacity-90">Academic Assistant</div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-indigo-100 text-indigo-600" : "bg-sky-100 text-sky-600"}`}>
                      {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-sm"
                          : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                      <span className="text-xs text-slate-500 font-medium">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder="Ask about attendance or marks..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-full pl-5 pr-12 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition disabled:opacity-50"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full transition"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] text-slate-400">Powered by Gemini AI</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

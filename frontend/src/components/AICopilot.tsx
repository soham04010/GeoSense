"use client";

import { useState, useRef, useEffect } from "react";
import { askCopilot } from "@/lib/api";
import { CitySummary, CityAnomalies } from "@/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AICopilotProps {
  city: string;
  summary: CitySummary | null;
  anomalies: CityAnomalies | null;
}

export default function AICopilot({ city, summary, anomalies }: AICopilotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const context = { summary, anomalies };

  useEffect(() => {
    if (open && !initialized && summary) {
      setInitialized(true);
      sendMessage(`Give me a concise environmental status summary for ${city} based on the current data.`, true);
    }
  }, [open, summary]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string, silent = false) {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    if (!silent) {
      setMessages((prev) => [...prev, userMsg]);
    }
    setInput("");
    setLoading(true);

    try {
      const data = await askCopilot(city, text, context);
      const reply = data.reply || "I couldn't generate a response.";
      setMessages((prev) => [
        ...(silent ? prev : prev),
        { role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection failed. Please check your API key and connection." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      {/* Sleek Trigger Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 text-slate-900 hover:bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:scale-[1.02] active:scale-95 border border-slate-200"
        aria-label="Toggle Copilot"
      >
        {open ? (
          <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        )}
      </button>

      {/* Floating Modern Panel */}
      <div
        className={`fixed bottom-28 right-8 z-50 w-[380px] h-[580px] flex flex-col rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right ${
          open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Minimal Header */}
        <div className="flex flex-col gap-1 px-6 py-5 border-b border-white/5">
          <h3 className="text-white text-sm font-semibold tracking-wide flex items-center gap-2">
            GeoSense AI
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h3>
          <p className="text-slate-400 text-xs font-medium">{city} Context Active</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-none">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
              <svg className="w-8 h-8 text-slate-600/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-xs font-medium">Ready to analyze City data</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              {msg.role === "assistant" && (
                <span className="text-[10px] text-slate-500 font-medium tracking-wide pl-1 mb-1.5 uppercase">AI Assistant</span>
              )}
              <div
                className={`max-w-[90%] px-4 py-3 text-[13px] leading-relaxed tracking-wide shadow-sm ${
                  msg.role === "user"
                    ? "bg-slate-200 text-slate-900 rounded-2xl rounded-tr-md font-medium"
                    : "bg-white/5 border border-white/5 text-slate-200 rounded-2xl rounded-tl-md backdrop-blur-md"
                }`}
              >
                <span className="whitespace-pre-wrap">{msg.content}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-slate-500 font-medium tracking-wide pl-1 mb-1.5 uppercase">AI Assistant</span>
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-md px-5 py-4 backdrop-blur-md">
                <div className="flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-[bounce_1s_infinite_0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-[bounce_1s_infinite_200ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-[bounce_1s_infinite_400ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-transparent">
          <div className="flex flex-col gap-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-2 transition-all focus-within:bg-slate-800 focus-within:border-slate-600 shadow-inner">
            <div className="flex gap-2 px-2 pt-1 overflow-x-auto scrollbar-none">
              {["Air quality data", "Heat risks", "Suggest actions"].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-700/30 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-2 pb-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                disabled={loading}
                className="flex-1 bg-transparent text-slate-200 text-[13px] placeholder:text-slate-500 font-medium outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-white text-slate-900 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Bot, Sparkles, Send,
  Minus, Maximize2, User,
} from "lucide-react";
import Link from "next/link";
import { chatAPI } from "@/services/api";
import { useLanguage } from "@/hooks/useLanguage";

type Message = { role: "user" | "assistant"; content: string };
type ViewState = "closed" | "minimized" | "open";

const QUICK_QUESTIONS = [
  { label: "फसल रोग की जानकारी", prompt: "मेरी फसल में रोग के लक्षण क्या हैं?" },
  { label: "उर्वरक की सलाह", prompt: "मेरी फसल के लिए उर्वरक की सिफारिश करें" },
  { label: "मौसम अलर्ट", prompt: "आज के मौसम के लिए खेती की सलाह दें" },
];

export default function FloatingChat() {
  const [view, setView] = useState<ViewState>("closed");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "नमस्ते! 🌾 मैं KisanSathi हूं। खेती के बारे में कुछ भी पूछें!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();

  useEffect(() => {
    if (view === "open") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, view]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await chatAPI.send(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        language
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "सर्वर से जुड़ने में समस्या हो रही है। कृपया Full Chat Interface खोलें।",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ─── FAB button (always visible when closed or minimized) ───
  const showFAB = view === "closed";
  const showMinimizedBadge = view === "minimized";

  return (
    <>
      {/* ── Expanded chat window ── */}
      <AnimatePresence>
        {view === "open" && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.88, y: 24, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            style={{
              position: "fixed",
              bottom: "90px",
              right: "20px",
              zIndex: 200,
              width: "clamp(300px, 90vw, 380px)",
              maxHeight: "calc(100vh - 140px)",
              borderRadius: "20px",
              background: "rgba(5,8,22,0.97)",
              backdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(74,222,128,0.22)",
              boxShadow:
                "0 16px 60px rgba(0,0,0,0.55), 0 0 28px rgba(74,222,128,0.12)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "14px 16px",
                background:
                  "linear-gradient(135deg,rgba(74,222,128,0.14),rgba(34,211,238,0.07))",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexShrink: 0,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 12px rgba(74,222,128,0.35)",
                  flexShrink: 0,
                }}
              >
                <Bot size={18} color="#050816" />
              </div>

              {/* Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "-0.01em",
                  }}
                >
                  KisanSathi
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#4ADE80",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#4ADE80",
                      display: "inline-block",
                      boxShadow: "0 0 6px #4ADE80",
                      animation: "pulse-glow 2s ease-in-out infinite",
                    }}
                  />
                  Online — Groq LLaMA 3
                </div>
              </div>

              {/* Window controls */}
              <div style={{ display: "flex", gap: "4px" }}>
                {/* Full screen link */}
                <Link
                  href="/dashboard/chat"
                  title="Open full chat"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94A3B8",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  <Maximize2 size={13} />
                </Link>
                {/* Minimize */}
                <button
                  onClick={() => setView("minimized")}
                  title="Minimize"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94A3B8",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <Minus size={13} />
                </button>
                {/* Close */}
                <button
                  onClick={() => setView("closed")}
                  title="Close"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "rgba(248,113,113,0.1)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#F87171",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Quick prompts */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                padding: "10px 14px 6px",
                overflowX: "auto",
                scrollbarWidth: "none",
                flexShrink: 0,
              }}
            >
              {QUICK_QUESTIONS.map(({ label, prompt }) => (
                <button
                  key={label}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "20px",
                    background: "rgba(74,222,128,0.07)",
                    border: "1px solid rgba(74,222,128,0.18)",
                    color: "#4ADE80",
                    fontSize: "11px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "10px 14px",
                minHeight: "180px",
                maxHeight: "calc(100vh - 340px)",
              }}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                    flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  }}
                >
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background:
                        msg.role === "user"
                          ? "rgba(255,255,255,0.08)"
                          : "linear-gradient(135deg,#4ADE80,#22D3EE)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border:
                        msg.role === "user"
                          ? "1px solid rgba(255,255,255,0.1)"
                          : "none",
                    }}
                  >
                    {msg.role === "user" ? (
                      <User size={12} color="#94A3B8" />
                    ) : (
                      <Bot size={12} color="#050816" />
                    )}
                  </div>
                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "9px 12px",
                      borderRadius:
                        msg.role === "user"
                          ? "14px 14px 3px 14px"
                          : "14px 14px 14px 3px",
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg,#4ADE80,#22D3EE)"
                          : "rgba(255,255,255,0.06)",
                      border:
                        msg.role === "user"
                          ? "none"
                          : "1px solid rgba(255,255,255,0.09)",
                      color: msg.role === "user" ? "#050816" : "white",
                      fontSize: "12.5px",
                      lineHeight: 1.65,
                      fontWeight: msg.role === "user" ? 500 : 400,
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={12} color="#050816" />
                  </div>
                  <div
                    style={{
                      padding: "9px 14px",
                      borderRadius: "14px 14px 14px 3px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      display: "flex",
                      gap: "5px",
                      alignItems: "center",
                    }}
                  >
                    {[0, 0.2, 0.4].map((d, i) => (
                      <span
                        key={i}
                        className="typing-dot"
                        style={{
                          width: "6px",
                          height: "6px",
                          animationDelay: `${d}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div
              style={{
                padding: "10px 14px 14px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "14px",
                  padding: "4px 4px 4px 12px",
                  transition: "border-color 0.2s",
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="खेती का सवाल पूछें..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "white",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    lineHeight: 1.5,
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background:
                      loading || !input.trim()
                        ? "rgba(255,255,255,0.06)"
                        : "linear-gradient(135deg,#4ADE80,#22D3EE)",
                    border: "none",
                    cursor: loading || !input.trim() ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.22s ease",
                    boxShadow:
                      !loading && input.trim()
                        ? "0 2px 10px rgba(74,222,128,0.28)"
                        : "none",
                  }}
                >
                  <Send
                    size={15}
                    color={loading || !input.trim() ? "#64748B" : "#050816"}
                  />
                </motion.button>
              </div>

              {/* Full interface link */}
              <Link
                href="/dashboard/chat"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  marginTop: "8px",
                  padding: "8px",
                  borderRadius: "10px",
                  background: "rgba(74,222,128,0.06)",
                  border: "1px solid rgba(74,222,128,0.14)",
                  color: "#4ADE80",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                <Sparkles size={12} />
                Full Chat Interface →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Minimized pill ── */}
      <AnimatePresence>
        {view === "minimized" && (
          <motion.button
            key="minimized-pill"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={() => setView("open")}
            style={{
              position: "fixed",
              bottom: "90px",
              right: "20px",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "40px",
              background: "rgba(5,8,22,0.97)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(74,222,128,0.25)",
              boxShadow: "0 8px 28px rgba(0,0,0,0.4), 0 0 16px rgba(74,222,128,0.1)",
              cursor: "pointer",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bot size={14} color="#050816" />
            </div>
            <span>KisanSathi</span>
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#4ADE80",
                boxShadow: "0 0 6px #4ADE80",
                flexShrink: 0,
              }}
            />
            {/* Close minimized */}
            <span
              role="button"
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation();
                setView("closed");
              }}
              style={{
                marginLeft: "4px",
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                padding: "2px",
                borderRadius: "4px",
                transition: "color 0.2s",
              }}
            >
              <X size={13} />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── FAB (fully closed) ── */}
      <AnimatePresence>
        {view === "closed" && (
          <motion.button
            key="fab"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fab-btn"
            style={{ bottom: "90px", zIndex: 201 }}
            onClick={() => setView("open")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open AI chat"
          >
            <MessageCircle size={22} color="#050816" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

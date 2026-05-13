"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Trash2, Copy, Check,
  Sparkles, Mic, Paperclip,
} from "lucide-react";
import { chatAPI } from "@/services/api";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

type Message = { role: "user" | "assistant"; content: string; timestamp?: Date };

const QUICK_PROMPTS: { label: string; prompt: string }[] = [
  { label: "🌾 Yellow leaves", prompt: "My wheat crop has yellow leaves, what should I do?" },
  { label: "🌾 Rice fertilizer", prompt: "Best fertilizer for rice cultivation?" },
  { label: "🍅 Tomato care", prompt: "What fertilizer is best for tomatoes?" },
  { label: "🍄 Prevent fungal", prompt: "How to prevent fungal disease in crops?" },
  { label: "🌱 Kharif crops", prompt: "Best crop for black soil in Kharif season?" },
];

// ── Copy button ─────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      aria-label="Copy message"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "6px",
        padding: "4px 9px",
        cursor: "pointer",
        color: copied ? "#4ADE80" : "#64748B",
        fontSize: "11px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        transition: "all 0.2s",
        marginTop: "6px",
        fontFamily: "inherit",
      }}
    >
      {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
    </button>
  );
}

// ── Markdown-ish formatter ───────────────────────────────────────────────────
function formatAI(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^(\d+)\.\s/gm, '<span style="color:#4ADE80;font-weight:700">$1.</span> ')
    .replace(/^[-•]\s/gm, '<span style="color:#4ADE80">•</span> ')
    .replace(/\n/g, "<br/>");
}

// ── Auto-resize textarea hook ────────────────────────────────────────────────
function useAutoResize(ref: React.RefObject<HTMLTextAreaElement | null>, value: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [value, ref]);
}

// ── Chat page ────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaste! 🌾 I am **KisanSathi**, your smart farming assistant.\n\nAsk me anything about:\n- Crop diseases & treatment\n- Fertilizer recommendations\n- Weather alerts\n- Yield prediction\n\nI support **Hindi**, **Punjabi** and **English**!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { language, t } = useLanguage();

  useAutoResize(textareaRef, input);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || loading) return;

      const userMsg: Message = { role: "user", content, timestamp: new Date() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      // Reset textarea height
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      try {
        const res = await chatAPI.send(
          newMessages.map((m) => ({ role: m.role, content: m.content })),
          language
        );
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.data.response, timestamp: new Date() },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "⚠️ Sorry, I'm having trouble connecting to the AI server. Please check that your **GROQ_API_KEY** is set in the backend `.env` file.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
        textareaRef.current?.focus();
      }
    },
    [input, loading, messages, language]
  );

  const clearChat = () =>
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared! 🌱 How can I help you today?",
        timestamp: new Date(),
      },
    ]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100dvh - 80px)", /* dvh = dynamic viewport height (mobile-safe) */
        maxHeight: "calc(100vh - 80px)",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
          flexWrap: "wrap",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        {/* AI identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 14px rgba(74,222,128,0.32)",
              flexShrink: 0,
            }}
          >
            <Bot size={22} color="#050816" />
          </div>
          <div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              KisanSathi
            </h1>
            <div
              style={{
                fontSize: "12px",
                color: "#4ADE80",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                marginTop: "2px",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#4ADE80",
                  display: "inline-block",
                  boxShadow: "0 0 7px #4ADE80",
                  animation: "pulse-glow 2s ease-in-out infinite",
                }}
              />
              Online — Groq LLaMA 3
            </div>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <LanguageSwitcher />
          <button
            onClick={clearChat}
            aria-label="Clear chat"
            title="Clear chat"
            style={{
              padding: "9px",
              borderRadius: "10px",
              background: "rgba(248,113,113,0.07)",
              border: "1px solid rgba(248,113,113,0.14)",
              color: "#F87171",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* ── Quick prompts (horizontal scroll) ── */}
      <div
        style={{
          display: "flex",
          gap: "7px",
          overflowX: "auto",
          paddingBottom: "10px",
          marginBottom: "12px",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch" as any,
          flexShrink: 0,
        }}
      >
        {QUICK_PROMPTS.map(({ label, prompt }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.03, borderColor: "rgba(74,222,128,0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => sendMessage(prompt)}
            disabled={loading}
            style={{
              padding: "7px 14px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#94A3B8",
              fontSize: "12px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
              flexShrink: 0,
              fontFamily: "inherit",
            }}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {/* ── Messages ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          paddingRight: "2px",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 3%, black 97%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 3%, black 97%, transparent 100%)",
        }}
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                flexShrink: 0,
                background:
                  msg.role === "user"
                    ? "rgba(255,255,255,0.07)"
                    : "linear-gradient(135deg,#4ADE80,#22D3EE)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border:
                  msg.role === "user"
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "none",
                boxShadow:
                  msg.role === "assistant"
                    ? "0 0 10px rgba(74,222,128,0.2)"
                    : "none",
              }}
            >
              {msg.role === "user" ? (
                <User size={15} color="#94A3B8" />
              ) : (
                <Bot size={15} color="#050816" />
              )}
            </div>

            {/* Bubble + actions */}
            <div style={{ maxWidth: "78%" }}>
              <div
                className={
                  msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                }
              >
                {msg.role === "assistant" ? (
                  <div
                    style={{ fontSize: "14px", lineHeight: 1.78, margin: 0 }}
                    dangerouslySetInnerHTML={{ __html: formatAI(msg.content) }}
                  />
                ) : (
                  <p
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.7,
                      margin: 0,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content}
                  </p>
                )}
              </div>
              {/* Timestamp + copy */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "4px",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}
              >
                {msg.timestamp && (
                  <span style={{ fontSize: "10px", color: "#475569" }}>
                    {msg.timestamp.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                {msg.role === "assistant" && i > 0 && (
                  <CopyButton text={msg.content} />
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#4ADE80,#22D3EE)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 10px rgba(74,222,128,0.2)",
                }}
              >
                <Bot size={15} color="#050816" />
              </div>
              <div
                className="chat-bubble-ai"
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                  padding: "12px 16px",
                }}
              >
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div
        style={{
          marginTop: "14px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.09)",
          padding: "8px",
          transition: "border-color 0.2s",
          flexShrink: 0,
        }}
        onFocusCapture={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(74,222,128,0.3)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 0 0 3px rgba(74,222,128,0.07)";
        }}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(255,255,255,0.09)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }
        }}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={t("type_message")}
          rows={1}
          disabled={loading}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "white",
            fontSize: "14px",
            fontFamily: "inherit",
            lineHeight: 1.6,
            resize: "none",
            padding: "4px 10px",
            maxHeight: "140px",
            overflowY: "auto",
            letterSpacing: "-0.01em",
          }}
        />

        {/* Bottom row: hint + action buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "6px",
            paddingLeft: "10px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "#475569",
              userSelect: "none",
            }}
          >
            Enter ↵ to send · Shift+Enter for new line
          </span>

          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {/* Send */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              title="Send (Enter)"
              style={{
                height: "40px",
                padding: "0 18px",
                borderRadius: "12px",
                background:
                  loading || !input.trim()
                    ? "rgba(255,255,255,0.06)"
                    : "linear-gradient(135deg,#4ADE80,#22D3EE)",
                border: "none",
                cursor: loading || !input.trim() ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                transition: "all 0.22s ease",
                boxShadow:
                  !loading && input.trim()
                    ? "0 2px 14px rgba(74,222,128,0.28)"
                    : "none",
                color: loading || !input.trim() ? "#64748B" : "#050816",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "inherit",
              }}
            >
              <Send
                size={15}
                color={loading || !input.trim() ? "#64748B" : "#050816"}
              />
              Send
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

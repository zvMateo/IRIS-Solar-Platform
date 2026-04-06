"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Sparkles, RotateCcw, Play } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const DEMO_QUESTIONS = [
  { label: "📊 Resumen ejecutivo", q: "Dame un resumen ejecutivo del estado actual de todas las instalaciones" },
  { label: "⚡ Top generadores", q: "¿Cuáles son las 3 instalaciones que más generaron este mes?" },
  { label: "🚨 Alertas críticas", q: "¿Qué instalaciones tienen alertas críticas y qué acciones recomiendas?" },
  { label: "🌿 Impacto ambiental", q: "Con la generación actual, ¿cuánto CO₂ evitamos y cuánto ahorramos este año?" },
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [mode, setMode] = useState<"openai" | "n8n" | "fallback" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Ref de messages para usar en runDemoScript sin dep stale
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string, currentMessages?: Message[]) => {
    if (!text.trim() || isLoading) return;

    const historyToUse = currentMessages ?? messagesRef.current;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history: historyToUse }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      if (data.mode) setMode(data.mode);
      return data.response as string;
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Lo siento, no pude conectarme en este momento. Intentá de nuevo.",
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isLoading]);

  // Demo script: envía 2 preguntas icónicas con delay entre ellas
  const runDemoScript = async () => {
    if (isDemoRunning || isLoading) return;
    setIsDemoRunning(true);
    clearChat();
    // pequeño delay para que se vea el clear
    await new Promise((r) => setTimeout(r, 300));
    const scriptQuestions = [DEMO_QUESTIONS[0].q, DEMO_QUESTIONS[2].q];
    for (const q of scriptQuestions) {
      await sendMessage(q, messagesRef.current);
      await new Promise((r) => setTimeout(r, 1200));
    }
    setIsDemoRunning(false);
  };

  const clearChat = () => {
    setMessages([]);
    setMode(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const modeBadge = mode ? {
    n8n: { label: "n8n Agent", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    openai: { label: "GPT-4o", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    fallback: { label: "Smart Fallback", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  }[mode] : null;

  return (
    <div className="bg-iris-card border border-iris-border rounded-xl flex flex-col h-full">
      {/* ── Header ── */}
      <div className="p-3 border-b border-iris-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-iris-gold/10 border border-iris-gold/20">
            <Sparkles className="w-4 h-4 text-iris-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-iris-text">Asistente IRIS IA</h3>
              {modeBadge && (
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium border ${modeBadge.color}`}>
                  {modeBadge.label}
                </span>
              )}
            </div>
            <p className="text-[10px] text-iris-text-muted">Consultá sobre tus instalaciones en tiempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Demo script button */}
          <button
            onClick={runDemoScript}
            disabled={isDemoRunning || isLoading}
            title="Ejecutar demo automático"
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-iris-gold/10 text-iris-gold border border-iris-gold/20 hover:bg-iris-gold/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play className="w-2.5 h-2.5" />
            {isDemoRunning ? "Demo..." : "Demo"}
          </button>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              title="Limpiar conversación"
              className="p-1.5 rounded-lg text-iris-text-muted hover:text-iris-text hover:bg-iris-dark transition-all cursor-pointer"
              aria-label="Limpiar conversación"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-3"
        role="log"
        aria-live="polite"
        aria-label="Conversación con el asistente"
      >
        {/* Estado vacío */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-iris-gold/10 border border-iris-gold/20 flex items-center justify-center mb-4">
              <Bot className="w-7 h-7 text-iris-gold" />
            </div>
            <p className="text-sm font-semibold text-iris-text mb-1">Hola, soy el asistente IRIS</p>
            <p className="text-xs text-iris-text-muted mb-5 max-w-[240px]">
              Preguntame sobre generación, alertas, mantenimientos o cualquier dato del sistema.
            </p>
            <div className="w-full space-y-2">
              {DEMO_QUESTIONS.map(({ label, q }) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left px-3 py-2.5 rounded-lg border border-iris-border text-xs text-iris-text-muted hover:border-iris-gold/40 hover:bg-iris-gold/5 hover:text-iris-text transition-all duration-150 cursor-pointer group"
                >
                  <span className="text-iris-gold mr-2 group-hover:mr-3 transition-all">{label}</span>
                  <span className="text-iris-text-muted/70">{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mensajes */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {/* Avatar asistente */}
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-iris-gold/10 border border-iris-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3 h-3 text-iris-gold" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-iris-gold/15 text-iris-text border border-iris-gold/20 rounded-br-sm"
                  : "bg-iris-dark text-iris-text border border-iris-border rounded-bl-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                /* ── Markdown rendering para respuestas del asistente ── */
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="text-iris-gold font-semibold">{children}</strong>,
                    ul: ({ children }) => <ul className="space-y-0.5 my-1.5 pl-1">{children}</ul>,
                    ol: ({ children }) => <ol className="space-y-0.5 my-1.5 pl-1 list-decimal list-inside">{children}</ol>,
                    li: ({ children }) => (
                      <li className="flex items-start gap-1.5">
                        <span className="text-iris-gold mt-0.5 flex-shrink-0">•</span>
                        <span>{children}</span>
                      </li>
                    ),
                    code: ({ children }) => (
                      <code className="bg-iris-card px-1.5 py-0.5 rounded text-iris-teal font-mono text-[10px]">{children}</code>
                    ),
                    h1: ({ children }) => <h1 className="text-sm font-bold text-iris-text mb-1">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xs font-bold text-iris-gold mb-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xs font-semibold text-iris-text mb-1">{children}</h3>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <span>{msg.content}</span>
              )}
            </div>

            {/* Avatar usuario */}
            {msg.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-iris-teal/20 border border-iris-teal/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3 h-3 text-iris-teal" />
              </div>
            )}
          </div>
        ))}

        {/* Loading con dots animados */}
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-iris-gold/10 border border-iris-gold/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3 h-3 text-iris-gold" />
            </div>
            <div className="bg-iris-dark border border-iris-border rounded-xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-iris-gold/60"
                  style={{ animation: `bounce 1s ease-in-out ${delay}ms infinite` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div className="p-3 border-t border-iris-border flex-shrink-0">
        {/* Hint de teclado */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Escribí tu consulta... (Enter para enviar)"
            disabled={isLoading}
            maxLength={500}
            className="flex-1 bg-iris-dark border border-iris-border rounded-lg px-3 py-2 text-xs text-iris-text placeholder-iris-text-muted/60 focus:outline-none focus:border-iris-gold/50 focus:ring-1 focus:ring-iris-gold/20 disabled:opacity-50 transition-all"
            aria-label="Mensaje para el asistente"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-lg bg-iris-gold text-iris-dark hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
            aria-label="Enviar mensaje"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        {input.length > 400 && (
          <p className="text-[10px] text-iris-text-muted mt-1 text-right">{input.length}/500</p>
        )}
      </div>

      {/* Bounce animation style */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "¿Cuál es la instalación que más generó este mes?",
  "¿Qué parques tienen alertas activas?",
  "Dame un resumen ejecutivo de hoy",
  "¿Qué instalaciones necesitan mantenimiento pronto?",
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"n8n" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history: messages }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.error || data?.details || "Error en la respuesta del servidor",
        );
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
      if (data.mode) setMode(data.mode);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Lo siento, hubo un error al procesar tu consulta.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-iris-card border border-iris-border rounded-xl flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <div className="p-3 border-b border-iris-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-iris-gold/10">
            <Sparkles className="w-4 h-4 text-iris-gold" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-iris-text">
              Asistente IRIS IA
            </h3>
            <p className="text-[10px] text-iris-text-muted">
              Consultá sobre tus instalaciones solares
            </p>
          </div>
        </div>
        {mode && (
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
              mode === "n8n"
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                : mode === "openai"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}
          >
            {mode === "n8n"
              ? "🤖 n8n Agent"
              : mode === "openai"
                ? "⚡ GPT-4o"
                : "🧠 Fallback"}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px]">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <Bot className="w-10 h-10 text-iris-gold/30 mx-auto mb-3" />
            <p className="text-sm text-iris-text font-medium mb-1">
              Hola, soy el asistente de IRIS
            </p>
            <p className="text-xs text-iris-text-muted mb-4">
              Preguntame sobre tus instalaciones, generación, alertas o
              cualquier dato del sistema.
            </p>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-iris-border text-xs text-iris-text-muted hover:border-iris-gold/30 hover:text-iris-text transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-iris-gold/20 text-iris-text border border-iris-gold/20"
                  : "bg-iris-dark text-iris-text-muted border border-iris-border"
              }`}
            >
              <div className="flex items-start gap-2">
                {msg.role === "assistant" && (
                  <Bot className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-iris-gold" />
                )}
                {msg.role === "user" && (
                  <User className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-iris-gold" />
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-iris-dark border border-iris-border rounded-xl px-3 py-2 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-iris-gold animate-spin" />
              <span className="text-xs text-iris-text-muted">Pensando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-iris-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !isLoading && sendMessage(input)
            }
            placeholder="Escribí tu consulta..."
            disabled={isLoading}
            className="flex-1 bg-iris-dark border border-iris-border rounded-lg px-3 py-2 text-xs text-iris-text placeholder-iris-text-muted focus:outline-none focus:border-iris-gold/50 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-lg bg-iris-gold text-iris-dark hover:bg-iris-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

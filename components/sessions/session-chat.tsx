"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { Send } from "lucide-react";
import type { SessionMessage } from "@/lib/types";

interface SessionChatProps {
  sessionId: string;
  currentUserId: string;
  initialMessages: SessionMessage[];
}

export function SessionChat({ sessionId, currentUserId, initialMessages }: SessionChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<SessionMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch {
        // silently fail
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  function scrollToBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput("");

    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "送信に失敗しました");
      }

      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      toast(err instanceof Error ? err.message : "エラーが発生しました", "error");
      setInput(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-[13px] text-[#999]">まだメッセージがありません</p>
            <p className="text-[11px] text-[#ccc] mt-0.5">練習相手に挨拶してみましょう</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          const name = msg.profiles?.display_name ?? "匿名";
          return (
            <div key={msg.id} className={`flex gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
              {!isMine && <Avatar name={name} size="sm" />}
              <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
                {!isMine && (
                  <p className="text-[10px] text-[#999] mb-0.5 ml-1">{name}</p>
                )}
                <div className={`rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                  isMine
                    ? "bg-[#059669] text-white rounded-tr-sm"
                    : "bg-[#f5f5f7] text-[#1a1a1a] rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
                <p className={`text-[9px] text-[#ccc] mt-0.5 ${isMine ? "text-right mr-1" : "ml-1"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 border border-[#e5e5e5] rounded-full bg-white px-4 py-2 text-[13px] text-[#1a1a1a] placeholder:text-[#999] focus:border-[#059669] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="h-9 w-9 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:opacity-80 transition-opacity"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

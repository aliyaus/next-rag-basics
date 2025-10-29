"use client";

import { ChatHeader, MessageBubble, MessageFooterText } from "@/components/BasicChatLayout";
import { PromptSuggestionRow } from "@/components/PromptSuggestions";
import Spinner from "@/components/Spinner";
import { useEffect, useRef, useState } from "react";

export default function Home() {

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey there! This is a simple demo chat. Type a message below.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg = { content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      // const response = await fetch('/api/chat', {
      const response = await fetch('/api/supabase-chat', {
        method: 'POST',
        body: JSON.stringify(userMsg),
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      console.log("Client response received: ", data)
      const reply = data.reply;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]); setIsSending(false);
    } catch (e) {
      console.error('Error fetching response', e)
      setIsSending(false)
    }
  }


  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-black dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
        <ChatHeader />
        <PromptSuggestionRow
          handleSubmit={handleSubmit}
          setInput={setInput}
        />

        {/* Messages */}
        <main className="flex-1 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <ul className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <li key={`message-${i}`} className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className={`mt-1 h-7 w-7 shrink-0 rounded-full ${m.role === "assistant"
                    ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500"
                    : "bg-gradient-to-br from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-600"
                    }`}
                />
                <MessageBubble text={m.content} role={m.role} />

              </li>
            ))}
            {isSending && <div className="text-center"><Spinner /></div>}
            <div ref={bottomRef} />
          </ul>
        </main>

        <form
          onSubmit={handleSubmit}
          className="sticky bottom-0 mt-4 flex items-end gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="min-h-[44px] max-h-40 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-800 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition enabled:hover:bg-indigo-500 disabled:opacity-50"
            aria-label="Send"
          >
            {isSending ? (
              <span className="animate-pulse">Sending…</span>
            ) : (
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M2.3 3.3a1 1 0 0 1 1.1-.15l18 9a1 1 0 0 1 0 1.8l-18 9A1 1 0 0 1 2 22V14l11-1-11-1V4a1 1 0 0 1 .3-.7z" />
                </svg>
                <span>Send</span>
              </div>
            )}
          </button>
        </form>

        <MessageFooterText />
      </div>
    </div>
  );
}

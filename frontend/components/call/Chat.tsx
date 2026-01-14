'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import type { ChatMessage } from './types';

export function ChatBox({ messages, onSend, theme }: { messages: ChatMessage[]; onSend: (text: string) => void; theme?: "light" | "dark" }) {
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);
  const [tab, setTab] = useState<'chat' | 'participants'>('chat');

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <section className={`flex h-full flex-col overflow-hidden rounded-xl border ${
      theme === "light"
        ? "border-emerald-200/30 bg-white/95"
        : "border-emerald-300/15 bg-[#0b1412]"
    }`}>
      <div className="px-4 pt-3">
        <div className="flex items-center gap-6">
          <button
            className={`pb-2 text-sm font-medium ${
              tab === 'chat' 
                ? theme === "light" ? 'text-emerald-700' : 'text-emerald-200'
                : theme === "light" ? 'text-emerald-600/60 hover:text-emerald-700' : 'text-emerald-300/60 hover:text-emerald-200'
            }`}
            onClick={() => setTab('chat')}
            type="button"
          >
            Chat
          </button>
          <button
            className={`pb-2 text-sm font-medium ${
              tab === 'participants' 
                ? theme === "light" ? 'text-emerald-700' : 'text-emerald-200'
                : theme === "light" ? 'text-emerald-600/60 hover:text-emerald-700' : 'text-emerald-300/60 hover:text-emerald-200'
            }`}
            onClick={() => setTab('participants')}
            type="button"
          >
            Participants
          </button>
        </div>
        <div className="relative h-[2px] w-full bg-transparent">
          <div
            className={`absolute bottom-0 h-[2px] w-16 rounded-full bg-orange-400 transition-transform duration-300 ${
              tab === 'chat' ? 'translate-x-0' : 'translate-x-24'
            }`}
          />
        </div>
      </div>

      {tab === 'chat' ? (
        <>
          <div ref={listRef} className="flex-1 space-y-3 overflow-auto p-3 custom-scrollbar" style={{ scrollBehavior: 'smooth' }}>
            {renderWithSeparators(messages).map((item) =>
              item.type === 'separator' ? (
                <div key={item.key} className="py-2 text-center">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs ring-1 ${
                    theme === "light"
                      ? "bg-emerald-100/60 text-emerald-700 ring-emerald-200/50"
                      : "bg-emerald-900/40 text-emerald-200 ring-emerald-300/15"
                  }`}>
                    {item.label}
                  </span>
                </div>
              ) : (
                <ChatBubble key={item.key} msg={item.msg} theme={theme} />
              )
            )}
            {messages.length === 0 && (
              <div className={`text-center text-sm ${
                theme === "light" ? "text-emerald-600/70" : "text-emerald-200/70"
              }`}>No messages yet</div>
            )}
          </div>
          <div className={`flex items-center gap-2 border-t px-3 py-3 ${
            theme === "light"
              ? "border-emerald-200/30 bg-white/95"
              : "border-emerald-300/10 bg-[#0b1412]"
          }`}>
            <div className={`flex-1 rounded-full border pl-4 pr-2 py-1.5 ${
              theme === "light"
                ? "border-emerald-200/40 bg-emerald-50/60"
                : "border-emerald-300/15 bg-emerald-950/60"
            }`}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Send your message..."
                className={`max-h-28 w-full resize-none bg-transparent text-[15px] outline-none ${
                  theme === "light"
                    ? "text-emerald-800 placeholder:text-emerald-500/50"
                    : "text-emerald-100 placeholder:text-emerald-300/50"
                }`}
              />
            </div>
            <button
              type="button"
              onClick={send}
              className={`grid h-10 w-10 place-items-center rounded-full shadow disabled:opacity-50 ${
                theme === "light"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                  : "bg-gradient-to-r from-emerald-400 to-emerald-600 text-[#0b1412] hover:from-emerald-500 hover:to-emerald-700"
              }`}
              disabled={!text.trim()}
              title="Send"
            >
              <Send size={18} />
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 p-4 text-sm text-emerald-200/80">Participants view coming soon.</div>
      )}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === "light" ? "linear-gradient(90deg, #10b981 60%, #059669 100%)" : "linear-gradient(90deg, #10b981 60%, #059669 100%)"};
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === "light" ? "linear-gradient(90deg, #059669 60%, #047857 100%)" : "linear-gradient(90deg, #059669 60%, #10b981 100%)"};
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${theme === "light" ? "#10b981 #f1f5f9" : "#10b981 #0b1412"};
        }
      `}</style>
    </section>
  );
}

export function ChatBubble({ msg, theme = "dark" }: { msg: ChatMessage; theme?: "light" | "dark" }) {
  const isYou = msg.author === 'You';
  const isSystem = msg.author === 'System';
  const initials = msg.initials ?? (msg.name ? toInitials(msg.name) : msg.author.slice(0, 2).toUpperCase());
  const name = msg.name ?? (isYou ? 'You' : isSystem ? 'System' : 'Guest');
  const time = formatTime(msg.ts);

  return (
    <div className={`flex items-end gap-2 ${isYou ? 'justify-end' : 'justify-start'}`}>
      {!isYou && (
        <div
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
            theme === "light"
              ? "bg-emerald-500 text-white"
              : "bg-orange-500 text-white"
          }`}
        >
          {initials}
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl p-3 text-sm shadow ${
          isYou
            ? theme === "light"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white ring-1 ring-emerald-200/25"
              : "bg-gradient-to-r from-emerald-700 to-emerald-600 text-emerald-50 ring-1 ring-emerald-300/25"
            : isSystem
            ? theme === "light"
              ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/50"
              : "bg-emerald-900/60 text-emerald-200 ring-1 ring-emerald-300/10"
            : theme === "light"
              ? "bg-gray-100 text-gray-800 ring-1 ring-gray-200/50"
              : "bg-emerald-950/80 text-emerald-100 ring-1 ring-emerald-300/10"
        }`}
      >
        <div
          className={`mb-1 flex items-center justify-between text-[11px] uppercase tracking-wide ${
            isYou
              ? theme === "light"
                ? "text-emerald-100/90"
                : "text-emerald-200/80"
              : theme === "light"
                ? "text-gray-600/80"
                : "text-emerald-300/70"
          }`}
        >
          <span>{name}</span>
          <span>{time}</span>
        </div>
        <div className="whitespace-pre-wrap leading-6">{msg.text}</div>
      </div>
      {isYou && <div className="h-8 w-8 shrink-0" />}
    </div>
  );
}

export function renderWithSeparators(msgs: ChatMessage[]) {
  const out: Array<
    | { type: 'separator'; key: string; label: string }
    | { type: 'msg'; key: string; msg: ChatMessage }
  > = [];
  let lastDay = '';
  msgs.forEach((m) => {
    const day = formatDayKey(m.ts);
    if (day !== lastDay) {
      out.push({ type: 'separator', key: `sep-${day}-${m.id}`, label: formatDateTime(m.ts) });
      lastDay = day;
    }
    out.push({ type: 'msg', key: m.id, msg: m });
  });
  return out;
}

function formatDayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDateTime(ts: number) {
  const d = new Date(ts);
  const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${date}, ${time}`;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function toInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}



'use client'

import { useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }
type Session = { id: string; title: string; createdAt: string }

interface ChatTabProps {
  messages: Message[]
  loading: boolean
  input: string
  setInput: (val: string) => void
  sendMessage: () => void
  sessions: Session[]
  showSessions: boolean
  setShowSessions: (val: boolean) => void
  newSession: () => void
  loadSession: (id: string) => void
  currentSessionId: string | null
}

export default function ChatTab({
  messages, loading, input, setInput, sendMessage,
  sessions, showSessions, setShowSessions, newSession, loadSession, currentSessionId
}: ChatTabProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Header sessions */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setShowSessions(!showSessions)}
          className="text-xs font-bold text-gray-400 hover:text-accent transition-colors"
        >
          {showSessions ? '✕ Close' : `🕐 History (${sessions.length})`}
        </button>
        <button
          onClick={newSession}
          className="text-xs font-bold text-accent hover:opacity-70 transition-opacity"
        >
          + New chat
        </button>
      </div>

      {/* Liste des sessions */}
      {showSessions && (
        <div className="flex flex-col gap-2 mb-4 max-h-40 overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">No history yet</p>
          ) : sessions.map(s => (
            <button
              key={s.id}
              onClick={() => loadSession(s.id)}
              className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                s.id === currentSessionId
                  ? 'bg-accent text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 mb-4 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
            <p className="text-sm font-bold text-gray-400">
              Omg Kenza t'es là! 🫶 <br />Tell me everything, how's your day going?
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-3 rounded-[1.8rem] text-sm font-medium leading-relaxed ${
              m.role === 'user'
                ? 'bubble-user rounded-br-none'
                : 'bubble-ai rounded-bl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bubble-ai px-5 py-3 rounded-[1.8rem] rounded-bl-none flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-4 text-base font-medium placeholder-gray-300 outline-none focus:ring-2 ring-accent/20 transition-all"
          placeholder="What's on your mind?"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-accent text-white p-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-accent/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="bold" viewBox="0 0 256 256">
            <path d="M227.32,28.68a16,16,0,0,0-15.66-4.08l-192,64a16,16,0,0,0-2.49,29.6l85.25,42.62a1.45,1.45,0,0,1,.67.67l42.62,85.25a16,16,0,0,0,14.28,8.83h.45a16,16,0,0,0,14.87-11.32l64-192A16,16,0,0,0,227.32,28.68ZM151.78,211.53l-34.46-68.91,52-52a8,8,0,0,0-11.32-11.32l-52,52-68.91-34.46L214.24,41.76Z"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}
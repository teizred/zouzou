'use client'

import { useState, useEffect } from 'react'
import ChatTab from '@/components/ChatTab'
import DiaryTab from '@/components/DiaryTab'
import TodoTab from '@/components/TodoTab'
import MaybeTab from '@/components/MaybeTab'
import ConfirmModal from '@/components/ConfirmModal'
import { RefreshCwIcon } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }
type DiaryEntry = { id: string; text: string; date: string; createdAt: string }
type Todo = { id: string; text: string; vote: string | null; createdAt: string }
type MaybeEntry = { id: string; text: string; createdAt: string }
type Session = { id: string; title: string; createdAt: string }

export default function Home() {
  const [tab, setTab] = useState<'chat' | 'diary' | 'todo' | 'maybe'>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [diary, setDiary] = useState<DiaryEntry[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [maybeList, setMaybeList] = useState<MaybeEntry[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showSessions, setShowSessions] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [todoInput, setTodoInput] = useState('')
  const [diaryInput, setDiaryInput] = useState('')
  const [maybeInput, setMaybeInput] = useState('')
  const [editingDiaryId, setEditingDiaryId] = useState<string | null>(null)
  const [editingDiaryText, setEditingDiaryText] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [quote, setQuote] = useState<string>('')
  const [errorStatus, setErrorStatus] = useState<string | null>(null)

  const wrappedFetch = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options)
      const data = await res.json()
      if (data.error) {
        setErrorStatus(`Erreur API: ${data.error}`)
        setTimeout(() => setErrorStatus(null), 8000)
        return null
      }
      return data
    } catch (err: any) {
      setErrorStatus(`Problème de connexion: ${err.message}`)
      setTimeout(() => setErrorStatus(null), 8000)
      return null
    }
  }

  useEffect(() => {
    wrappedFetch('/api/diary').then(data => Array.isArray(data) && setDiary(data))
    wrappedFetch('/api/todos').then(data => Array.isArray(data) && setTodos(data))
    wrappedFetch('/api/maybe').then(data => Array.isArray(data) && setMaybeList(data))
    wrappedFetch('/api/quote').then(data => data?.text && setQuote(data.text))
    wrappedFetch('/api/sessions').then((data) => {
      if (Array.isArray(data)) {
        setSessions(data)
        if (data.length > 0) {
          setSessionId(data[0].id)
          wrappedFetch(`/api/messages?sessionId=${data[0].id}`).then(msgs => Array.isArray(msgs) && setMessages(msgs))
        }
      }
    })
  }, [])

  const newSession = async () => {
    const session = await wrappedFetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
      })
    })
    if (session?.id) {
      setSessions(prev => [session, ...prev].slice(0, 10))
      setSessionId(session.id)
      setMessages([])
      setShowSessions(false)
    }
  }

  const loadSession = async (id: string) => {
    setSessionId(id)
    const msgs = await wrappedFetch(`/api/messages?sessionId=${id}`)
    if (Array.isArray(msgs)) {
      setMessages(msgs)
      setShowSessions(false)
    }
  }

  const parseResponse = async (text: string) => {
    const diaryMatch = text.match(/\[DIARY:\s*(.+?)\]/)
    const todoMatch = text.match(/\[TODO:\s*(.+?)\]/)

    if (diaryMatch) {
      const saved = await wrappedFetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: diaryMatch[1].trim() })
      })
      if (saved?.id) setDiary(prev => [saved, ...prev])
    }

    if (todoMatch) {
      const saved = await wrappedFetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: todoMatch[1].trim() })
      })
      if (saved?.id) setTodos(prev => [...prev, saved])
    }

    return text.replace(/\[DIARY:.*?\]/g, '').replace(/\[TODO:.*?\]/g, '').trim()
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    let currentSessionId = sessionId

    if (!currentSessionId) {
      const session = await wrappedFetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
        })
      })
      if (session?.id) {
        setSessions(prev => [session, ...prev].slice(0, 10))
        setSessionId(session.id)
        currentSessionId = session.id
      } else return
    }

    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    await wrappedFetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: currentSessionId, role: 'user', content: input })
    })

    const data = await wrappedFetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages })
    })

    if (data?.content) {
      const clean = await parseResponse(data.content)

      await wrappedFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentSessionId, role: 'assistant', content: clean })
      })

      setMessages(prev => [...prev, { role: 'assistant', content: clean }])
      
      if (newMessages.length === 1) {
        try {
          const sumRes = await wrappedFetch('/api/chat/summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [...newMessages, { role: 'assistant', content: clean }] })
          })
          if (sumRes?.title) {
            await wrappedFetch(`/api/sessions?id=${currentSessionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: sumRes.title })
            })
            setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, title: sumRes.title } : s))
          }
        } catch (err) {
          console.error("Failed to generate summary:", err)
        }
      }
    }
    setLoading(false)
  }

  const vote = async (id: string, val: 'yes' | 'no') => {
    const todo = todos.find(t => t.id === id)
    const newVote = todo?.vote === val ? null : val
    const updated = await wrappedFetch('/api/todos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, vote: newVote })
    })
    if (updated?.id) {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, vote: newVote } : t))
    }
  }

  const addTodo = async () => {
    if (!todoInput.trim()) return
    const saved = await wrappedFetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: todoInput.trim() })
    })
    if (saved?.id) {
      setTodos(prev => [...prev, saved])
      setTodoInput('')
    }
  }

  const addDiaryEntry = async () => {
    if (!diaryInput.trim()) return
    const saved = await wrappedFetch('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: diaryInput.trim() })
    })
    if (saved?.id) {
      setDiary(prev => [saved, ...prev])
      setDiaryInput('')
    }
  }

  const removeDiaryEntry = async (id: string) => {
    setConfirmText('Effacer ce souvenir ?')
    setConfirmAction(() => async () => {
      const res = await wrappedFetch('/api/diary', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res?.success) {
        setDiary(prev => prev.filter(e => e.id !== id))
        setConfirmOpen(false)
      }
    })
    setConfirmOpen(true)
  }

  const updateDiaryEntry = async () => {
    if (!editingDiaryId || !editingDiaryText.trim()) return
    const updated = await wrappedFetch('/api/diary', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingDiaryId, text: editingDiaryText.trim() })
    })
    if (updated?.id) {
      setDiary(prev => prev.map(e => e.id === editingDiaryId ? updated : e))
      setEditingDiaryId(null)
      setEditingDiaryText('')
    }
  }

  const removeTodo = async (id: string) => {
    setConfirmText('Supprimer cette tâche ?')
    setConfirmAction(() => async () => {
      const res = await wrappedFetch('/api/todos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res?.id) {
        setTodos(prev => prev.filter(t => t.id !== id))
        setConfirmOpen(false)
      }
    })
    setConfirmOpen(true)
  }

  const addMaybe = async () => {
    if (!maybeInput.trim()) return
    const saved = await wrappedFetch('/api/maybe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: maybeInput.trim() })
    })
    if (saved?.id) {
      setMaybeList(prev => [saved, ...prev])
      setMaybeInput('')
    }
  }

  const removeMaybe = async (id: string) => {
    setConfirmText("Oublier cette idée ?")
    setConfirmAction(() => async () => {
      const res = await wrappedFetch('/api/maybe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res?.success) {
        setMaybeList(prev => prev.filter(m => m.id !== id))
        setConfirmOpen(false)
      }
    })
    setConfirmOpen(true)
  }

  const moveToTodo = async (item: MaybeEntry) => {
    const saved = await wrappedFetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: item.text })
    })
    if (saved?.id) {
      setTodos(prev => [...prev, saved])
      await wrappedFetch('/api/maybe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id })
      })
      setMaybeList(prev => prev.filter(m => m.id !== item.id))
    }
  }

  const refreshQuote = async () => {
    setQuote('Refining your motivation...')
    const data = await wrappedFetch('/api/quote?force=true')
    if (data?.text) setQuote(data.text)
  }

  const removeSession = async (id: string) => {
    setConfirmText('Effacer cette conversation ?')
    setConfirmAction(() => async () => {
      const res = await wrappedFetch(`/api/sessions?id=${id}`, { method: 'DELETE' })
      if (res?.success) {
        setSessions(prev => prev.filter(s => s.id !== id))
        if (sessionId === id) {
          setSessionId(null)
          setMessages([])
        }
        setConfirmOpen(false)
      }
    })
    setConfirmOpen(true)
  }

  return (
    <main className="min-h-screen py-10 px-4 flex justify-center items-start">
      {/* Error Alert Overlay */}
      {errorStatus && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="bold" viewBox="0 0 256 256">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path>
          </svg>
          <p className="text-sm">{errorStatus}</p>
        </div>
      )}

      <div className="w-full max-w-lg flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center shadow-lg shadow-accent/20 mb-4 animate-in fade-in zoom-in duration-500">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Hi, Kenza</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Personal Space</p>
          {quote && (
            <div className="mt-3 px-4 py-3 bg-accent/5 rounded-2xl max-w-sm relative group">
              <p className="text-xs font-medium text-accent/80 leading-relaxed text-center italic">
                "{quote}"
              </p>
              <button 
                onClick={refreshQuote}
                className="absolute -right-2 -top-2 p-1.5 bg-white shadow-sm border border-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95"
                title="Refresh quote"
              >
                <RefreshCwIcon size={12} className="text-accent" />
              </button>
            </div>
          )}
        </div>

        <div className="bento-card p-1.5 rounded-2xl flex gap-1 bg-white/50 backdrop-blur-sm">
          {(['chat', 'diary', 'todo', 'maybe'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 ${
                tab === t ? 'bg-accent text-white shadow-md shadow-accent/20' : 'text-gray-400'
              }`}
            >
              {t === 'chat' ? 'Assistant' : t === 'diary' ? 'Journal' : t === 'todo' ? 'Tasks' : 'Maybe'}
            </button>
          ))}
        </div>

        <div className={`bento-card rounded-[2.5rem] p-6 flex flex-col h-[550px] transition-all duration-700 ${
          tab === 'maybe' ? 'shadow-[0_20px_60px_-15px_rgba(56,189,248,0.15)] ring-1 ring-sky-50' : ''
        }`}>
          {tab === 'chat' && (
            <ChatTab
              messages={messages}
              loading={loading}
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              sessions={sessions}
              showSessions={showSessions}
              setShowSessions={setShowSessions}
              newSession={newSession}
              loadSession={loadSession}
              currentSessionId={sessionId}
              removeSession={removeSession}
            />
          )}
          {tab === 'diary' && (
            <DiaryTab
              diary={diary}
              editingDiaryId={editingDiaryId}
              setEditingDiaryId={setEditingDiaryId}
              editingDiaryText={editingDiaryText}
              setEditingDiaryText={setEditingDiaryText}
              diaryInput={diaryInput}
              setDiaryInput={setDiaryInput}
              addDiaryEntry={addDiaryEntry}
              removeDiaryEntry={removeDiaryEntry}
              updateDiaryEntry={updateDiaryEntry}
            />
          )}
          {tab === 'todo' && (
            <TodoTab
              todos={todos}
              vote={vote}
              removeTodo={removeTodo}
              todoInput={todoInput}
              setTodoInput={setTodoInput}
              addTodo={addTodo}
            />
          )}
          {tab === 'maybe' && (
            <MaybeTab
              maybeList={maybeList}
              moveToTodo={moveToTodo}
              removeMaybe={removeMaybe}
              maybeInput={maybeInput}
              setMaybeInput={setMaybeInput}
              addMaybe={addMaybe}
            />
          )}
        </div>

        <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
          Design by Teizred • 2026
        </p>

        <ConfirmModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          text={confirmText}
          onConfirm={() => confirmAction?.()}
        />
      </div>
    </main>
  )
}
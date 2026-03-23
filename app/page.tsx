'use client'

import { useState, useEffect } from 'react'
import ChatTab from '@/components/ChatTab'
import DiaryTab from '@/components/DiaryTab'
import TodoTab from '@/components/TodoTab'
import MaybeTab from '@/components/MaybeTab'
import InsightsTab from '@/components/InsightsTab'
import ConfirmModal from '@/components/ConfirmModal'
import CoupleInvite from '@/components/CoupleInvite'
import { RefreshCwIcon } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

type Message = { role: 'user' | 'assistant'; content: string }
type DiaryEntry = { id: string; text: string; date: string; createdAt: string }
type Todo = { id: string; text: string; vote: string | null; createdAt: string; isShared: boolean }
type MaybeEntry = { id: string; text: string; createdAt: string; isShared: boolean }
type Session = { id: string; title: string; createdAt: string }
type MoodEntry = { id: string; value: string; note: string | null; date: string; createdAt: string }
type SummaryEntry = { id: string; weekStart: string; content: string; createdAt: string }

export default function Home() {
  const [space, setSpace] = useState<'personal' | 'shared'>('personal')
  const [coupleStatus, setCoupleStatus] = useState<any>(null)
  const [tab, setTab] = useState<'chat' | 'diary' | 'todo' | 'maybe' | 'insights'>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [diary, setDiary] = useState<DiaryEntry[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [maybeList, setMaybeList] = useState<MaybeEntry[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [summaries, setSummaries] = useState<SummaryEntry[]>([])
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

  const refreshCoupleStatus = async () => {
    try {
      const { couple } = await fetch('/api/couple/status').then(r => r.json())
      setCoupleStatus(couple)
    } catch {}
  }

  useEffect(() => {
    refreshCoupleStatus()
    fetch('/api/diary').then(r => r.json()).then(data => Array.isArray(data) && setDiary(data))
    fetch('/api/todos').then(r => r.json()).then(data => Array.isArray(data) && setTodos(data))
    fetch('/api/maybe').then(r => r.json()).then(data => Array.isArray(data) && setMaybeList(data))
    fetch('/api/quote').then(r => r.json()).then(data => data?.text && setQuote(data.text))
    fetch('/api/moods').then(r => r.json()).then(data => Array.isArray(data) && setMoods(data))
    fetch('/api/summary').then(r => r.json()).then(data => Array.isArray(data) && setSummaries(data))
    fetch('/api/sessions').then(r => r.json()).then((data) => {
      if (Array.isArray(data)) {
        setSessions(data)
        if (data.length > 0) {
          setSessionId(data[0].id)
          fetch(`/api/messages?sessionId=${data[0].id}`).then(r => r.json()).then(msgs => Array.isArray(msgs) && setMessages(msgs))
        }
      }
    })
  }, [])
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending])

  if (isPending || !session) return null

  const newSession = async () => {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
      })
    })
    const session = await res.json()
    setSessions(prev => [session, ...prev].slice(0, 10))
    setSessionId(session.id)
    setMessages([])
    setShowSessions(false)
  }

  const loadSession = async (id: string) => {
    setSessionId(id)
    const msgs = await fetch(`/api/messages?sessionId=${id}`).then(r => r.json())
    setMessages(msgs)
    setShowSessions(false)
  }

  const parseResponse = async (text: string) => {
    const diaryMatch = text.match(/\[DIARY:\s*(.+?)\]/i)
    const todoMatch = text.match(/\[TODO:\s*(.+?)\]/i)

    if (diaryMatch) {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: diaryMatch[1].trim() })
      })
      const saved = await res.json()
      setDiary(prev => [saved, ...prev])
    }

    if (todoMatch) {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: todoMatch[1].trim(), isShared: false }) // Chat adds to personal
      })
      const saved = await res.json()
      setTodos(prev => [...prev, saved])
    }

    return text.replace(/\[DIARY:.*?\]/gi, '').replace(/\[TODO:.*?\]/gi, '').trim()
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    let currentSessionId = sessionId

    if (!currentSessionId) {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
        })
      })
      const session = await res.json()
      setSessions(prev => [session, ...prev].slice(0, 10))
      setSessionId(session.id)
      currentSessionId = session.id
    }

    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: currentSessionId, role: 'user', content: input })
    })

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages })
    })

    const data = await res.json()
    const clean = await parseResponse(data.content)

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: currentSessionId, role: 'assistant', content: clean })
    })

    setMessages(prev => [...prev, { role: 'assistant', content: clean }])
    setLoading(false)

    if (newMessages.length === 1) {
      try {
        const sumRes = await fetch('/api/chat/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...newMessages, { role: 'assistant', content: clean }] })
        })
        const { title } = await sumRes.json()
        await fetch(`/api/sessions?id=${currentSessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title })
        })
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, title } : s))
      } catch (err) {
        console.error("Failed to generate summary:", err)
      }
    }
  }

  const vote = async (id: string, val: 'yes' | 'no') => {
    const todo = todos.find(t => t.id === id)
    const newVote = todo?.vote === val ? null : val
    await fetch('/api/todos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, vote: newVote })
    })
    setTodos(prev => prev.map(t => t.id === id ? { ...t, vote: newVote } : t))
  }

  const addTodo = async () => {
    if (!todoInput.trim()) return
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: todoInput.trim(), isShared: space === 'shared' })
    })
    const saved = await res.json()
    if (saved?.id) {
      setTodos(prev => [...prev, saved])
      setTodoInput('')
    }
  }

  const addDiaryEntry = async () => {
    if (!diaryInput.trim()) return
    const res = await fetch('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: diaryInput.trim() })
    })
    const saved = await res.json()
    if (saved?.id) {
      setDiary(prev => [saved, ...prev])
      setDiaryInput('')
    }
  }

  const removeDiaryEntry = async (id: string) => {
    setConfirmText('Effacer ce souvenir ?')
    setConfirmAction(() => async () => {
      await fetch('/api/diary', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setDiary(prev => prev.filter(e => e.id !== id))
      setConfirmOpen(false)
    })
    setConfirmOpen(true)
  }

  const updateDiaryEntry = async () => {
    if (!editingDiaryId || !editingDiaryText.trim()) return
    const res = await fetch('/api/diary', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingDiaryId, text: editingDiaryText.trim() })
    })
    const updated = await res.json()
    if (updated?.id) {
      setDiary(prev => prev.map(e => e.id === editingDiaryId ? updated : e))
      setEditingDiaryId(null)
      setEditingDiaryText('')
    }
  }

  const removeTodo = async (id: string) => {
    setConfirmText('Supprimer cette tâche ?')
    setConfirmAction(() => async () => {
      await fetch('/api/todos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setTodos(prev => prev.filter(t => t.id !== id))
      setConfirmOpen(false)
    })
    setConfirmOpen(true)
  }

  const addMaybe = async () => {
    if (!maybeInput.trim()) return
    const res = await fetch('/api/maybe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: maybeInput.trim(), isShared: space === 'shared' })
    })
    const saved = await res.json()
    setMaybeList(prev => [saved, ...prev])
    setMaybeInput('')
  }

  const removeMaybe = async (id: string) => {
    setConfirmText("Oublier cette idée ?")
    setConfirmAction(() => async () => {
      await fetch('/api/maybe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setMaybeList(prev => prev.filter(m => m.id !== id))
      setConfirmOpen(false)
    })
    setConfirmOpen(true)
  }

  const moveToTodo = async (item: MaybeEntry) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: item.text, isShared: item.isShared })
    })
    const saved = await res.json()
    setTodos(prev => [...prev, saved])
    await fetch('/api/maybe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id })
    })
    setMaybeList(prev => prev.filter(m => m.id !== item.id))
  }

  const refreshQuote = async () => {
    setQuote('Refining your motivation...')
    try {
      const res = await fetch('/api/quote?force=true')
      const data = await res.json()
      setQuote(data.text)
    } catch (err) {
      console.error(err)
    }
  }

  const removeSession = async (id: string) => {
    setConfirmText('Effacer cette conversation ?')
    setConfirmAction(() => async () => {
      await fetch(`/api/sessions?id=${id}`, { method: 'DELETE' })
      setSessions(prev => prev.filter(s => s.id !== id))
      if (sessionId === id) {
        setSessionId(null)
        setMessages([])
      }
      setConfirmOpen(false)
    })
    setConfirmOpen(true)
  }

  const filteredTodos = todos.filter(t => space === 'shared' ? t.isShared : !t.isShared)
  const filteredMaybe = maybeList.filter(m => space === 'shared' ? m.isShared : !m.isShared)
  const tabs = space === 'shared' ? (['todo', 'maybe'] as const) : (['chat', 'diary', 'todo', 'maybe', 'insights'] as const)

  return (
    <main className="min-h-screen py-10 px-4 flex justify-center items-start">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center shadow-lg shadow-accent/20 mb-4 animate-in fade-in zoom-in duration-500">
            <span className="text-3xl">{space === 'shared' ? '✌️' : '✨'}</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Hi, {session.user?.name || 'there'}</h1>
          
          <div className="flex bg-gray-100/80 backdrop-blur-sm rounded-xl p-1 mt-3 mx-auto shadow-inner">
            <button 
              onClick={() => { setSpace('personal'); setTab('maybe') }} 
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-300 ${space === 'personal' ? 'bg-white shadow-sm text-accent' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Personal Space
            </button>
            <button 
              onClick={() => { setSpace('shared'); setTab('maybe') }} 
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-300 ${space === 'shared' ? 'bg-white shadow-sm text-violet-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Our Maybe List
            </button>
          </div>

          {space === 'personal' && quote && (
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

        <div className={`bento-card p-1.5 rounded-2xl flex gap-1 bg-white/50 backdrop-blur-sm overflow-x-auto scrollbar-hide ${space === 'shared' && (!coupleStatus || coupleStatus.status !== 'accepted') ? 'hidden' : ''}`}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 min-w-[70px] py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 ${
                tab === t ? (space === 'shared' ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20' : 'bg-accent text-white shadow-md shadow-accent/20') : 'text-gray-400'
              }`}
            >
              {t === 'chat' ? 'Assistant' : t === 'diary' ? 'Journal' : t === 'todo' ? 'Tasks' : t === 'maybe' ? 'Maybe' : 'Insights'}
            </button>
          ))}
        </div>

        <div className={`bento-card rounded-[2.5rem] p-6 flex flex-col h-[550px] transition-all duration-700 ${
          tab === 'maybe' ? 'shadow-[0_20px_60px_-15px_rgba(56,189,248,0.15)] ring-1 ring-sky-50' : ''
        } ${space === 'shared' ? 'ring-1 ring-violet-50 shadow-[0_20px_60px_-15px_rgba(139,92,246,0.15)] bg-linear-to-b from-white to-violet-50/30' : ''}`}>

          {space === 'shared' && (!coupleStatus || coupleStatus.status !== 'accepted') ? (
            <CoupleInvite status={coupleStatus} refresh={refreshCoupleStatus} />
          ) : (
            <>
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
                  todos={filteredTodos}
                  vote={vote}
                  removeTodo={removeTodo}
                  todoInput={todoInput}
                  setTodoInput={setTodoInput}
                  addTodo={addTodo}
                />
              )}
              {tab === 'maybe' && (
                <MaybeTab
                  maybeList={filteredMaybe}
                  moveToTodo={moveToTodo}
                  removeMaybe={removeMaybe}
                  maybeInput={maybeInput}
                  setMaybeInput={setMaybeInput}
                  addMaybe={addMaybe}
                />
              )}
          {tab === 'insights' && (
            <InsightsTab
              moods={moods}
              setMoods={setMoods}
              summaries={summaries}
              setSummaries={setSummaries}
            />
              )}
            </>
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
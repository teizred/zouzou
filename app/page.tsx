'use client'

import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }
type DiaryEntry = { id: string; text: string; date: string; createdAt: string }
type Todo = { id: string; text: string; vote: string | null; createdAt: string }
type MaybeEntry = { id: string; text: string; createdAt: string }

export default function Home() {
  const [tab, setTab] = useState<'chat' | 'diary' | 'todo' | 'maybe'>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [diary, setDiary] = useState<DiaryEntry[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [maybeList, setMaybeList] = useState<MaybeEntry[]>([])
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
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/diary').then(r => r.json()).then(setDiary)
    fetch('/api/todos').then(r => r.json()).then(setTodos)
    fetch('/api/maybe').then(r => r.json()).then(setMaybeList)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const parseResponse = async (text: string) => {
    const diaryMatch = text.match(/\[DIARY:\s*(.+?)\]/)
    const todoMatch = text.match(/\[TODO:\s*(.+?)\]/)

    if (diaryMatch) {
      const entry = {
        text: diaryMatch[1].trim()
      }
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
      const saved = await res.json()
      setDiary(prev => [saved, ...prev])
    }

    if (todoMatch) {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: todoMatch[1].trim() })
      })
      const saved = await res.json()
      setTodos(prev => [...prev, saved])
    }

    return text.replace(/\[DIARY:.*?\]/g, '').replace(/\[TODO:.*?\]/g, '').trim()
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages })
    })

    const data = await res.json()
    const clean = await parseResponse(data.content)
    setMessages(prev => [...prev, { role: 'assistant', content: clean }])
    setLoading(false)
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
      body: JSON.stringify({ text: todoInput.trim() })
    })
    const saved = await res.json()
    setTodos(prev => [...prev, saved])
    setTodoInput('')
  }

  const addDiaryEntry = async () => {
    if (!diaryInput.trim()) return
    const entry = {
      text: diaryInput.trim()
    }
    const res = await fetch('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    })
    const saved = await res.json()
    setDiary(prev => [saved, ...prev])
    setDiaryInput('')
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
    setDiary(prev => prev.map(e => e.id === editingDiaryId ? updated : e))
    setEditingDiaryId(null)
    setEditingDiaryText('')
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
      body: JSON.stringify({ text: maybeInput.trim() })
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
      body: JSON.stringify({ text: item.text })
    })
    const saved = await res.json()
    setTodos(prev => [...prev, saved])
    
    // Remove from maybe
    await fetch('/api/maybe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id })
    })
    setMaybeList(prev => prev.filter(m => m.id !== item.id))
  }

  return (
    <main className="min-h-screen py-10 px-4 flex justify-center items-start">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center shadow-lg shadow-accent/20 mb-4 animate-in fade-in zoom-in duration-500">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Hi, Kenza</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            Personal Space
          </p>
        </div>

        {/* Tab Selection */}
        <div className="bento-card p-1.5 rounded-2xl flex gap-1 bg-white/50 backdrop-blur-sm">
          {(['chat', 'diary', 'todo', 'maybe'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 ${
                tab === t
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : 'text-gray-400'
              }`}
            >
              {t === 'chat' ? 'Assistant' : t === 'diary' ? 'Journal' : t === 'todo' ? 'Tasks' : 'Maybe'}
            </button>
          ))}
        </div>

        {/* Main Content Box */}
        <div className={`bento-card rounded-[2.5rem] p-6 flex flex-col h-[550px] transition-all duration-700 ${
          tab === 'maybe' ? 'shadow-[0_20px_60px_-15px_rgba(56,189,248,0.15)] ring-1 ring-sky-50' : ''
        }`}>
          {tab === 'chat' && (
            <div className="flex flex-col h-full">
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

              <div className="flex gap-2">
                <input
                  className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-medium placeholder-gray-300 outline-none focus:ring-2 ring-accent/20 transition-all"
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
          )}

          {tab === 'diary' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto flex flex-col gap-4 mb-6 scrollbar-hide">
                {diary.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                    <p className="text-sm font-bold text-gray-400">Your story starts here 😁</p>
                  </div>
                ) : diary.map((e) => (
                  <div key={e.id} className="p-5 rounded-3xl border border-gray-100 bg-gray-50/30 group relative transition-all">
                    <span className="text-[10px] font-black uppercase text-accent tracking-tighter bg-accent-soft px-2 py-0.5 rounded-full mb-2 inline-block">
                      {new Date(e.createdAt).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                    {editingDiaryId === e.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          className="w-full bg-white border border-accent/20 rounded-xl p-3 text-sm font-medium outline-none h-24"
                          value={editingDiaryText}
                          onChange={ev => setEditingDiaryText(ev.target.value)}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={updateDiaryEntry}
                            className="bg-accent text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingDiaryId(null)}
                            className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-lg text-xs font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-gray-700 leading-relaxed pr-8">{e.text}</p>
                        <div className="absolute top-4 right-4 flex gap-1 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingDiaryId(e.id)
                              setEditingDiaryText(e.text)
                            }}
                            className="p-1.5 text-gray-400 transition-all"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="bold" viewBox="0 0 256 256">
                              <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31L140,71.31,184.69,116ZM196,104.69,151.31,60,171.31,40,216,84.69Z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => removeDiaryEntry(e.id)}
                            className="p-1.5 text-gray-400 transition-all"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="bold" viewBox="0 0 256 256">
                              <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm font-medium outline-none"
                  placeholder="Note a moment..."
                  value={diaryInput}
                  onChange={e => setDiaryInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addDiaryEntry()}
                />
                <button
                  onClick={addDiaryEntry}
                  disabled={!diaryInput.trim()}
                  className="px-6 py-3 bg-foreground text-white font-black rounded-2xl text-[10px] uppercase tracking-tighter transition-all active:scale-95 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {tab === 'todo' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-6 scrollbar-hide">
                {todos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                    <p className="text-sm font-bold text-gray-400">Zero tasks, Full focus hein? 😏</p>
                  </div>
                ) : todos.map((t) => (
                  <div key={t.id} className="flex flex-col p-4 rounded-2xl border border-gray-100 group gap-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${t.vote === 'yes' ? 'bg-teal-500' : t.vote === 'no' ? 'bg-rose-500' : 'bg-gray-200'}`}></div>
                      <span className={`flex-1 text-sm font-bold ${t.vote === 'yes' ? 'line-through text-gray-300' : 'text-gray-600'}`}>
                        {t.text}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => vote(t.id, 'yes')}
                          className={`p-2 rounded-xl transition-all ${t.vote === 'yes' ? 'bg-teal-500 text-white' : ''}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="bold" viewBox="0 0 256 256">
                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => removeTodo(t.id)}
                          className="p-2 rounded-xl text-gray-400 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="bold" viewBox="0 0 256 256">
                            <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    {t.createdAt && (
                      <span className="text-[9px] font-black uppercase text-gray-300 tracking-tighter ml-6">
                        {new Date(t.createdAt).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-sm font-medium outline-none"
                  placeholder="What's next?"
                  value={todoInput}
                  onChange={e => setTodoInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTodo()}
                />
                <button
                  onClick={addTodo}
                  disabled={!todoInput.trim()}
                  className="px-6 py-3 bg-foreground text-white font-black rounded-2xl text-[10px] uppercase tracking-tighter transition-all active:scale-95 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {tab === 'maybe' && (
            <div className="flex flex-col h-full animate-in fade-in duration-500">
              <div className="flex-1 overflow-y-auto flex flex-col gap-6 mb-6 scrollbar-hide p-2">
                <div className="flex flex-col items-center mb-4 gap-1">
                   <h2 className="text-3xl font-black text-sky-400 leading-none tracking-tighter">Maybe Yes</h2>
                   <h2 className="text-2xl font-black text-rose-300 leading-none tracking-tighter">Maybe No</h2>
                </div>

                {maybeList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                    <span className="text-5xl mb-4">💭</span>
                    <p className="text-sm font-bold text-gray-400 italic">No indecision today?<br/>Bravo Kenza! ✨</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5">
                    {maybeList.map((m, idx) => {
                      const colors = [
                        'bg-sky-50 border-sky-100',
                        'bg-rose-50 border-rose-100',
                        'bg-slate-50 border-slate-100',
                        'bg-amber-50 border-amber-100'
                      ]
                      const rotations = ['rotate-1', '-rotate-1', 'rotate-0', 'rotate-2', '-rotate-2']
                      const color = colors[idx % colors.length]
                      const rotation = rotations[idx % rotations.length]
                      
                      return (
                        <div 
                          key={m.id} 
                          className={`p-6 rounded-4xl border ${color} ${rotation} flex flex-col gap-6 shadow-sm active:rotate-0 transition-transform duration-300 hover:shadow-md h-fit`}
                        >
                          <p className="text-base font-bold text-gray-800 leading-snug">
                            {m.text}
                          </p>
                          <div className="flex gap-3">
                             <button
                               onClick={() => moveToTodo(m)}
                               className="flex-1 py-3.5 bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-sky-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                             >
                               <span>✨</span> Maybe Yes
                             </button>
                             <button
                               onClick={() => removeMaybe(m.id)}
                               className="flex-1 py-3.5 bg-rose-400 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                             >
                               <span>👋</span> Maybe No
                             </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-sky-50/40 border-none rounded-2xl px-5 py-4 text-sm font-medium placeholder-sky-200 outline-none ring-2 ring-transparent focus:ring-sky-100 transition-all"
                  placeholder="What's on your mind? 💭"
                  value={maybeInput}
                  onChange={e => setMaybeInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addMaybe()}
                />
                <button
                  onClick={addMaybe}
                  disabled={!maybeInput.trim()}
                  className="px-6 py-3 bg-sky-400 text-white font-black rounded-2xl text-[10px] uppercase tracking-tighter transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-sky-100"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
          Design by Teizred • 2026
        </p>

        {/* Confirmation Modal */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md" onClick={() => setConfirmOpen(false)} />
            <div className="relative w-full max-w-[280px] bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-black text-gray-800 leading-tight mb-2">Wait Kenza!</h3>
              <p className="text-sm font-bold text-gray-400 leading-relaxed mb-8">
                {confirmText}<br/>
                <span className="italic">T'es sûre de vouloir supprimer ça ?</span>
              </p>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={() => confirmAction?.()}
                  className="w-full py-4 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-100 active:scale-95 transition-all"
                >
                  Yes, delete it 👋
                </button>
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="w-full py-4 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
                >
                  No, keep it ✨
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
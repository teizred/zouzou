'use client'

import { useState } from 'react'

type MoodEntry = { id: string; value: string; note: string | null; date: string; createdAt: string }
type SummaryEntry = { id: string; weekStart: string; content: string; createdAt: string }

interface InsightsTabProps {
  moods: MoodEntry[]
  setMoods: React.Dispatch<React.SetStateAction<MoodEntry[]>>
  summaries: SummaryEntry[]
  setSummaries: React.Dispatch<React.SetStateAction<SummaryEntry[]>>
}

export default function InsightsTab({ moods, setMoods, summaries, setSummaries }: InsightsTabProps) {
  const [loadingSummary, setLoadingSummary] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const loggedToday = moods.some(m => m.date === today)

  const emojis = [
    { val: '1', emoji: '😭', label: 'Rough' },
    { val: '2', emoji: '😔', label: 'Low' },
    { val: '3', emoji: '😐', label: 'Okay' },
    { val: '4', emoji: '🙂', label: 'Good' },
    { val: '5', emoji: '🥰', label: 'Great' }
  ]

  const logMood = async (value: string) => {
    const res = await fetch('/api/moods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, date: today })
    })
    const saved = await res.json()
    if (saved?.id) {
      setMoods(prev => [saved, ...prev])
    }
  }

  const generateSummary = async () => {
    setLoadingSummary(true)
    const res = await fetch('/api/summary', { method: 'POST' })
    const saved = await res.json()
    if (saved?.id) {
      setSummaries(prev => [saved, ...prev])
    }
    setLoadingSummary(false)
  }

  // Pre-fill last 7 days for the chart
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 scrollbar-hide gap-8">
      
      {/* Mood Tracker Section */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mood Tracker</h2>
        
        {!loggedToday ? (
          <div className="p-5 rounded-3xl border border-sky-100 bg-sky-50/50 flex flex-col items-center text-center gap-4 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm font-bold text-sky-900">How are you feeling today?</p>
            <div className="flex gap-2 justify-center w-full">
              {emojis.map(e => (
                <button
                  key={e.val}
                  onClick={() => logMood(e.val)}
                  className="flex flex-col items-center gap-1 flex-1 p-2 bg-white rounded-2xl shadow-sm border border-sky-50 transition-all active:scale-95 active:border-sky-200"
                >
                  <span className="text-2xl transition-transform">{e.emoji}</span>
                  <span className="text-[8px] font-bold uppercase text-gray-400 tracking-tighter">{e.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50/30 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Recent Moods</span>
              <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">Logged Today ✨</span>
            </div>
            
            {/* Simple Sparkline Chart */}
            <div className="flex justify-between h-28 pt-4 px-2">
              {last7Days.map(date => {
                const dayMood = moods.find(m => m.date === date)
                const val = dayMood ? parseInt(dayMood.value) : 0
                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'narrow' })
                
                return (
                  <div key={date} className="flex flex-col items-center h-full gap-2 group flex-1">
                    <div className="w-5 flex-1 bg-gray-100 rounded-full flex flex-col justify-end overflow-hidden">
                      <div 
                        className={`w-full transition-all duration-1000 ${val >= 4 ? 'bg-emerald-400' : val === 3 ? 'bg-sky-400' : val > 0 ? 'bg-rose-400' : 'bg-transparent'}`}
                        style={{ height: `${(val / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] font-black text-gray-300 uppercase">{dayName}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* Weekly Insight Section */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Weekly Insight</h2>
          <button 
            onClick={generateSummary}
            disabled={loadingSummary}
            className="text-[9px] font-black uppercase bg-foreground text-white px-3 py-1.5 rounded-full tracking-tighter hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1"
          >
            {loadingSummary ? 'Thinking...' : 'Generate New'}
          </button>
        </div>

        {summaries.length === 0 && !loadingSummary ? (
          <div className="p-8 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center text-center opacity-50">
            <span className="text-2xl mb-2">🔮</span>
            <p className="text-xs font-bold text-gray-400">Generate your first weekly AI insight.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-4">
            {(summaries || []).map((s, idx) => (
              <div key={s.id} className={`p-5 rounded-3xl border transition-all ${idx === 0 ? 'bg-violet-50/50 border-violet-100 shadow-sm shadow-violet-100/50' : 'bg-gray-50/30 border-gray-100 opacity-60'}`}>
                <div className="text-[10px] font-black uppercase text-violet-400 tracking-tighter bg-violet-100/50 px-2 py-0.5 rounded-full inline-block mb-3">
                  Week of {new Date(s.weekStart).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </div>
                <div className="text-sm font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {s.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
    </div>
  )
}

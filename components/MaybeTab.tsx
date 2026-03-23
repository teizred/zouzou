'use client'

type MaybeEntry = { id: string; text: string; createdAt: string; isShared: boolean }

interface MaybeTabProps {
  maybeList: MaybeEntry[]
  moveToTodo: (item: MaybeEntry) => void
  removeMaybe: (id: string) => void
  maybeInput: string
  setMaybeInput: (text: string) => void
  addMaybe: () => void
}

export default function MaybeTab({
  maybeList,
  moveToTodo,
  removeMaybe,
  maybeInput,
  setMaybeInput,
  addMaybe
}: MaybeTabProps) {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto flex flex-col gap-6 mb-6 scrollbar-hide p-2">
        <div className="flex flex-col items-center mb-4 gap-1">
           <h2 className="text-3xl font-black text-sky-400 leading-none tracking-tighter">Maybe Yes</h2>
           <h2 className="text-2xl font-black text-rose-300 leading-none tracking-tighter">Maybe No</h2>
        </div>

        {maybeList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
            <span className="text-5xl mb-4">💭</span>
            <p className="text-sm font-bold text-gray-400 italic">No indecision today?<br/>Bravo! ✨</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {(maybeList || []).map((m, idx) => {
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
          className="flex-1 bg-sky-50/40 border-none rounded-2xl px-5 py-4 text-base font-medium placeholder-sky-200 outline-none ring-2 ring-transparent focus:ring-sky-100 transition-all"
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
  )
}

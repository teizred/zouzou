'use client'

type DiaryEntry = { id: string; text: string; date: string; createdAt: string }

interface DiaryTabProps {
  diary: DiaryEntry[]
  editingDiaryId: string | null
  setEditingDiaryId: (id: string | null) => void
  editingDiaryText: string
  setEditingDiaryText: (text: string) => void
  diaryInput: string
  setDiaryInput: (text: string) => void
  addDiaryEntry: () => void
  removeDiaryEntry: (id: string) => void
  updateDiaryEntry: () => void
}

export default function DiaryTab({
  diary,
  editingDiaryId,
  setEditingDiaryId,
  editingDiaryText,
  setEditingDiaryText,
  diaryInput,
  setDiaryInput,
  addDiaryEntry,
  removeDiaryEntry,
  updateDiaryEntry
}: DiaryTabProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 mb-6 scrollbar-hide">
        {diary.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
            <p className="text-sm font-bold text-gray-400">Your story starts here 😁</p>
          </div>
        ) : (diary || []).map((e) => (
          <div key={e.id} className="p-5 rounded-3xl border border-gray-100 bg-gray-50/30 group relative transition-all">
            <span className="text-[10px] font-black uppercase text-accent tracking-tighter bg-accent-soft px-2 py-0.5 rounded-full mb-2 inline-block">
              {new Date(e.createdAt).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            {editingDiaryId === e.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  className="w-full bg-white border border-accent/20 rounded-xl p-3 text-base font-medium outline-none h-24"
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
          className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-base font-medium outline-none"
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
  )
}

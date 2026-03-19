'use client'

type Todo = { id: string; text: string; vote: string | null; createdAt: string }

interface TodoTabProps {
  todos: Todo[]
  vote: (id: string, val: 'yes' | 'no') => void
  removeTodo: (id: string) => void
  todoInput: string
  setTodoInput: (text: string) => void
  addTodo: () => void
}

export default function TodoTab({
  todos,
  vote,
  removeTodo,
  todoInput,
  setTodoInput,
  addTodo
}: TodoTabProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-6 scrollbar-hide">
        {todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
            <p className="text-sm font-bold text-gray-400">Zero tasks, Full focus hein? 😏</p>
          </div>
        ) : (todos || []).map((t) => (
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
          className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-base font-medium outline-none"
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
  )
}

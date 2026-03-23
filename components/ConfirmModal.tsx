'use client'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  text: string
  onConfirm: () => void
}

export default function ConfirmModal({ isOpen, onClose, text, onConfirm }: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-[280px] bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-black text-gray-800 leading-tight mb-2">Wait!</h3>
        <p className="text-sm font-bold text-gray-400 leading-relaxed mb-8">
          {text}<br/>
          <span className="italic">T'es sûre de vouloir supprimer ça ?</span>
        </p>
        <div className="flex flex-col w-full gap-3">
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-100 active:scale-95 transition-all"
          >
            Yes, delete it 👋
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
          >
            No, keep it ✨
          </button>
        </div>
      </div>
    </div>
  )
}

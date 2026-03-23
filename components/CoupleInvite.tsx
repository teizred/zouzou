import { useState } from 'react'

export default function CoupleInvite({ status, refresh }: { status: any, refresh: () => void }) {
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateInvite = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/couple/invite', { method: 'POST' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate')
      refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const acceptInvite = async () => {
    if (!inviteCode.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/couple/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Invalid code')
      refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (status?.status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-full">
        <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4 text-3xl">⏳</div>
        <h2 className="text-xl font-bold mb-2 text-gray-800">En attente...</h2>
        <p className="text-sm text-gray-500 mb-6">Partage ce code avec ton partenaire pour lier vos comptes :</p>
        <div className="bg-white px-6 py-4 rounded-xl shadow-inner border border-gray-100 font-mono text-3xl font-black text-violet-500 tracking-widest mb-4">
          {status.inviteCode}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center h-full">
      <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4 text-3xl">✌️</div>
      <h2 className="text-xl font-bold mb-2 text-gray-800">Espace Partagé</h2>
      <p className="text-sm text-gray-500 mb-8 max-w-xs">Liez vos comptes pour créer une liste d'idées ("Maybe") et de tâches communes.</p>
      
      {error && <p className="text-red-500 text-xs mb-4 font-bold">{error}</p>}

      <div className="w-full flex flex-col gap-3">
        <button 
          onClick={generateInvite} 
          disabled={loading}
          className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          Générer mon code
        </button>
        
        <div className="flex items-center gap-2 my-2">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400 font-bold uppercase">Ou</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Code d'invitation" 
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 uppercase text-center font-mono font-bold"
            maxLength={6}
          />
          <button 
            onClick={acceptInvite}
            disabled={loading || !inviteCode.trim()}
            className="bg-gray-800 text-white font-bold px-6 rounded-xl disabled:opacity-50"
          >
            Lier
          </button>
        </div>
      </div>
    </div>
  )
}

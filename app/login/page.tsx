'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await authClient.signIn.email({ email, password })
    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }
    router.push('/')
  }

  const handleGoogle = async () => {
    await authClient.signIn.social({ provider: 'google' })
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="bento-card rounded-[2.5rem] p-8 w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center shadow-lg shadow-accent/20 mb-4 mx-auto">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-2xl font-black text-foreground">Welcome back</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Your Personal Space</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoogle}
            className="flex items-center justify-center gap-3 bg-white border border-gray-200 py-4 rounded-2xl font-bold text-sm text-gray-700 w-full transition-all active:scale-95 hover:bg-gray-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300 font-bold">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-gray-50 rounded-2xl px-5 py-4 text-sm font-medium placeholder-gray-300 outline-none focus:ring-2 ring-accent/20"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="bg-gray-50 rounded-2xl px-5 py-4 text-sm font-medium placeholder-gray-300 outline-none focus:ring-2 ring-accent/20"
          />
          {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-accent text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? '...' : 'Se connecter'}
          </button>
        </div>
      </div>
    </main>
  )
}
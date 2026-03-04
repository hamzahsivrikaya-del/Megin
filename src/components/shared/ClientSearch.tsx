'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Client {
  id: string
  full_name: string
}

export default function ClientSearch({ trainerId }: { trainerId?: string }) {
  const [query, setQuery] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let query = supabase
      .from('clients')
      .select('id, full_name')
      .eq('is_active', true)
      .order('full_name')
    if (trainerId) query = query.eq('trainer_id', trainerId)
    query.then(({ data }) => {
      if (data) setClients(data)
    })
  }, [trainerId])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = query.trim()
    ? clients.filter(c =>
        c.full_name.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))
      ).slice(0, 5)
    : []

  function handleSelect(id: string) {
    setQuery('')
    setOpen(false)
    router.push(`/dashboard/clients/${id}`)
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { if (query.trim()) setOpen(true) }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { setOpen(false); setQuery('') }
            if (e.key === 'Enter' && filtered.length === 1) handleSelect(filtered[0].id)
          }}
          placeholder="Danışan ara..."
          className="w-full pl-8 pr-3 py-2 text-base sm:text-sm bg-background border border-primary/30 rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary/60 transition-colors"
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className="w-full text-left px-3 py-2.5 text-sm text-text-primary hover:bg-surface-hover active:bg-surface-hover transition-colors flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-primary">
                  {c.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              {c.full_name}
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && filtered.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg p-3 z-50">
          <p className="text-xs text-text-secondary text-center">Sonuç bulunamadı</p>
        </div>
      )}
    </div>
  )
}

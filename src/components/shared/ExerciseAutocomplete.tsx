'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ExerciseAutocompleteProps {
  value: string
  onChange: (value: string) => void
  trainerId: string
  placeholder?: string
  className?: string
}

interface Suggestion {
  name: string
  frequency: number
}

export default function ExerciseAutocomplete({
  value,
  onChange,
  trainerId,
  placeholder = 'Egzersiz adı',
  className,
}: ExerciseAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setSuggestions([])
        setOpen(false)
        return
      }

      const supabase = createClient()
      const { data } = await supabase.rpc('search_exercises', {
        p_trainer_id: trainerId,
        p_query: query,
        p_limit: 10,
      })

      if (data && data.length > 0) {
        setSuggestions(data)
        setOpen(true)
        setActiveIndex(-1)
      } else {
        setSuggestions([])
        setOpen(false)
      }
    },
    [trainerId]
  )

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  function selectSuggestion(name: string) {
    onChange(name)
    setSuggestions([])
    setOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[activeIndex].name)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  // Dışarı tıklayınca kapat
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true)
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          'w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-text-primary',
          'placeholder:text-text-tertiary',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'border-border hover:border-text-tertiary'
        )}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-surface shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={s.name}
              onMouseDown={() => selectSuggestion(s.name)}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                'flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors',
                i === activeIndex
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-primary hover:bg-primary/5'
              )}
            >
              <span>{s.name}</span>
              <span className="text-xs text-text-tertiary">{s.frequency}x</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

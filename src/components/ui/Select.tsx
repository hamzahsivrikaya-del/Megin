'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-text-primary',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            error
              ? 'border-danger focus:ring-danger/20 focus:border-danger'
              : 'border-border hover:border-text-tertiary',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select

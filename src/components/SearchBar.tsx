interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  resultCount?: number
  totalCount?: number
}

export function SearchBar({ value, onChange, placeholder = 'Search...', resultCount, totalCount }: SearchBarProps) {
  return (
    <div className="relative">
      <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-faint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-3.5 pl-12 pr-4 text-sm text-[var(--text)] shadow-[var(--shadow)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-glow)]"
      />
      {resultCount !== undefined && totalCount !== undefined && value && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-faint)]">
          {resultCount} / {totalCount}
        </span>
      )}
    </div>
  )
}

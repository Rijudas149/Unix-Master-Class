import { useCopyToClipboard } from '../hooks/useCopyToClipboard'

interface CopyButtonProps {
  text: string
  id: string
  label?: string
  className?: string
}

export function CopyButton({ text, id, label = 'Copy', className = '' }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); copy(text, id) }}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all
        ${copied === id
          ? 'bg-[var(--success-soft)] text-[var(--success)]'
          : 'bg-[var(--surface-muted)] text-[var(--text-muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]'
        } ${className}`}
      aria-label={`Copy ${label}`}
    >
      {copied === id ? '✓ Copied!' : label}
    </button>
  )
}

import type { BookmarkType } from '../types'
import { useProgress } from '../context/ProgressContext'

interface BookmarkButtonProps {
  type: BookmarkType
  id: string
  label?: string
}

export function BookmarkButton({ type, id, label = 'Bookmark' }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useProgress()
  const saved = isBookmarked(type, id)

  return (
    <button
      type="button"
      className={`bookmark-btn ${saved ? 'saved' : ''}`}
      onClick={() => toggleBookmark(type, id)}
      title={saved ? 'Remove bookmark' : 'Save bookmark'}
      aria-label={saved ? `Remove ${label}` : `Save ${label}`}
    >
      {saved ? '★ Saved' : '☆ Save'}
    </button>
  )
}

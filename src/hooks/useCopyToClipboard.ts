import { useState, useCallback } from 'react'

export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = useCallback(
    async (text: string, id?: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(id ?? text)
        setTimeout(() => setCopied(null), timeout)
        return true
      } catch {
        return false
      }
    },
    [timeout],
  )

  return { copied, copy }
}

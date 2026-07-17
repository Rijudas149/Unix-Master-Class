export function isTableRow(line: string): boolean {
  const t = line.trim()
  return t.startsWith('|') && t.endsWith('|') && t.length > 2
}

export function isTableSeparator(line: string): boolean {
  const t = line.trim()
  return /^\|[\s:|\-]+\|$/.test(t) || /^[-|\s]+$/.test(t)
}

export function parseTableCells(line: string): string[] {
  const trimmed = line.trim()
  if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
    return trimmed
      .slice(1, -1)
      .split('|')
      .map((cell) => cell.trim())
  }
  if (trimmed.includes('|')) {
    return trimmed.split('|').map((cell) => cell.trim())
  }
  return trimmed.split(/\s{2,}/).map((cell) => cell.trim()).filter(Boolean)
}

export interface ParsedTable {
  headers: string[]
  rows: string[][]
}

export function parseTabularText(text: string): ParsedTable | null {
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return null

  if (isTableRow(lines[0]) && isTableSeparator(lines[1])) {
    return {
      headers: parseTableCells(lines[0]),
      rows: lines.slice(2).filter((l) => !isTableSeparator(l)).map(parseTableCells),
    }
  }

  if (lines[0].includes('|') && isTableSeparator(lines[1])) {
    return {
      headers: parseTableCells(lines[0]),
      rows: lines.slice(2).filter((l) => !isTableSeparator(l)).map(parseTableCells),
    }
  }

  if (lines.every((l) => l.includes('|'))) {
    const allRows = lines.map(parseTableCells)
    return { headers: allRows[0], rows: allRows.slice(1) }
  }

  return null
}

export function parseTableBlock(lines: string[], start: number): { table: ParsedTable; end: number } | null {
  if (!isTableRow(lines[start]) && !lines[start].trim().includes('|')) return null

  const tableLines: string[] = []
  let i = start
  while (i < lines.length) {
    const t = lines[i].trim()
    if (!t) break
    if (isTableRow(t) || isTableSeparator(t) || (tableLines.length > 0 && t.includes('|'))) {
      tableLines.push(t)
      i++
      continue
    }
    break
  }

  const parsed = parseTabularText(tableLines.join('\n'))
  if (!parsed) return null

  return { table: parsed, end: i }
}

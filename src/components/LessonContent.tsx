import { CodeBlock } from './CodeBlock'
import { parseTableBlock, parseTabularText, type ParsedTable } from '../utils/tabularParser'

type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; code: string }
  | { type: 'heading'; level: 3 | 4; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }

function parseSection(section: string): ContentBlock[] {
  const lines = section.split('\n')
  const blocks: ContentBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      i++
      continue
    }

    const table = parseTableBlock(lines, i)
    if (table) {
      blocks.push({ type: 'table', headers: table.table.headers, rows: table.table.rows })
      i = table.end
      continue
    }

    if (/^#{3,4}\s/.test(trimmed)) {
      const level = trimmed.startsWith('####') ? 4 : 3
      blocks.push({ type: 'heading', level, text: trimmed.replace(/^#{3,4}\s+/, '') })
      i++
      continue
    }

    if (/^\*\*[^*]+\*\*:?\s*$/.test(trimmed)) {
      const text = trimmed.replace(/\*\*/g, '').replace(/:$/, '').trim()
      blocks.push({ type: 'heading', level: 4, text })
      i++
      continue
    }

    if (/^-\s/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^-\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^-\s+/, ''))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i++
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    const paraLines: string[] = []
    while (i < lines.length) {
      const t = lines[i].trim()
      if (!t) break
      if (t.startsWith('|') || (t.includes('|') && paraLines.length === 0 && /^\w.*\|/.test(t))) break
      if (/^-\s/.test(t) || /^\d+\.\s/.test(t) || /^#{3,4}\s/.test(t)) break
      if (/^\*\*[^*]+\*\*:?\s*$/.test(t)) break
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join('\n') })
    }
  }

  return blocks
}

function parseContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = []
  const parts = content.split(/```([\s\S]*?)```/g)

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      const code = parts[i].trim()
      if (code) blocks.push({ type: 'code', code })
      continue
    }

    const text = parts[i].trim()
    if (!text) continue

    for (const section of text.split(/\n\n+/)) {
      const trimmed = section.trim()
      if (!trimmed) continue
      blocks.push(...parseSection(trimmed))
    }
  }

  return blocks
}

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="inline-code">{part.slice(1, -1)}</code>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function DataTable({ headers, rows, className = '' }: ParsedTable & { className?: string }) {
  return (
    <div className={`lesson-table-wrap ${className}`.trim()}>
      <table className="lesson-table">
        <thead>
          <tr>
            {headers.map((header, j) => (
              <th key={j}><InlineText text={header} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, j) => (
            <tr key={j}>
              {row.map((cell, k) => (
                <td key={k}><InlineText text={cell} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TabularDisplay({ text, language = 'output' }: { text: string; language?: string }) {
  const table = parseTabularText(text)
  if (table) {
    return <DataTable {...table} className="lesson-table-output" />
  }
  return <CodeBlock code={text} language={language} />
}

export function LessonContent({ content }: { content: string }) {
  const blocks = parseContent(content)

  return (
    <div className="lesson-prose">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={i} className="lesson-paragraph">
                {block.text.split('\n').map((line, j, arr) => (
                  <span key={j}>
                    <InlineText text={line} />
                    {j < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
            )
          case 'ul':
            return (
              <ul key={i} className="lesson-list">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <InlineText text={item} />
                  </li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={i} className="lesson-list lesson-list-ordered">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <InlineText text={item} />
                  </li>
                ))}
              </ol>
            )
          case 'code':
            return (
              <div key={i} className="lesson-inline-code">
                <CodeBlock code={block.code} language="bash" />
              </div>
            )
          case 'heading':
            if (block.level === 4) {
              return <h4 key={i} className="lesson-subheading">{block.text}</h4>
            }
            return <h3 key={i} className="lesson-subheading">{block.text}</h3>
          case 'table':
            return <DataTable key={i} headers={block.headers} rows={block.rows} />
          default:
            return null
        }
      })}
    </div>
  )
}

export function MarkdownContent({ content }: { content: string }) {
  return <LessonContent content={content} />
}

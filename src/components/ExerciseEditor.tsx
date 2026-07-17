import { useState } from 'react'
import type { Exercise } from '../types'
import { verifyCommand } from '../utils/commandVerifier'
import { CodeBlock } from './CodeBlock'

interface ExerciseEditorProps {
  exercise: Exercise
  onCorrect?: () => void
  onRevealSolution: () => void
  onMarkComplete: () => void
  solutionRevealed: boolean
}

export function ExerciseEditor({
  exercise,
  onCorrect,
  onRevealSolution,
  onMarkComplete,
  solutionRevealed,
}: ExerciseEditorProps) {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null)
  const [checked, setChecked] = useState(false)

  const handleVerify = () => {
    const verification = verifyCommand(code, exercise.solution, exercise.alternateSolutions ?? [])
    setResult({ correct: verification.correct, message: verification.message })
    setChecked(true)
    if (verification.correct) onCorrect?.()
  }

  const handleReset = () => {
    setCode('')
    setResult(null)
    setChecked(false)
  }

  return (
    <div className="exercise-editor">
      <div className="editor-header">
        <label htmlFor={`cmd-${exercise.id}`}>Your Command</label>
        <span className="editor-hint">Write your answer below, then click Check Answer</span>
      </div>
      <textarea
        id={`cmd-${exercise.id}`}
        className="sql-editor"
        value={code}
        onChange={(e) => { setCode(e.target.value); setResult(null); setChecked(false) }}
        placeholder="# Write your shell command here&#10;ls -lah ~"
        spellCheck={false}
        rows={4}
      />
      <div className="exercise-actions">
        <button type="button" className="btn btn-primary" onClick={handleVerify}>
          Check Answer ✓
        </button>
        <button type="button" className="btn btn-ghost" onClick={handleReset}>
          Clear
        </button>
        <button type="button" className="btn btn-secondary" onClick={onRevealSolution}>
          {solutionRevealed ? 'Hide Solution' : 'Show Solution'}
        </button>
        <button type="button" className="btn btn-primary" onClick={onMarkComplete}>
          Mark as Completed ✓
        </button>
      </div>
      {checked && result && (
        <div className={`verify-result ${result.correct ? 'verify-correct' : 'verify-wrong'}`}>
          <span className="verify-icon">{result.correct ? '✅' : '❌'}</span>
          <p>{result.message}</p>
        </div>
      )}
      {solutionRevealed && (
        <div className="solution-reveal">
          <h4>Expected Solution</h4>
          <CodeBlock code={exercise.solution} />
        </div>
      )}
    </div>
  )
}

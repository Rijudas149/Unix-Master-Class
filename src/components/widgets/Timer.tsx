import { useState, useEffect, useRef } from 'react';

export function Timer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const start = () => {
    if (!running) setRemaining(minutes * 60 + seconds);
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setRemaining(minutes * 60 + seconds);
  };

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;

  return (
    <div className="widget timer-widget">
      <div className="widget-label">Timer</div>
      {!running && remaining === minutes * 60 + seconds && (
        <div className="timer-inputs">
          <input type="number" min={0} max={99} value={minutes} onChange={(e) => setMinutes(+e.target.value)} />
          <span>:</span>
          <input type="number" min={0} max={59} value={seconds} onChange={(e) => setSeconds(+e.target.value)} />
        </div>
      )}
      <div className={`timer-display ${remaining === 0 ? 'timer-done' : ''}`}>
        {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
      </div>
      <div className="widget-controls">
        {!running ? (
          <button type="button" className="btn btn-primary" onClick={start}>Start</button>
        ) : (
          <button type="button" className="btn btn-secondary" onClick={pause}>Pause</button>
        )}
        <button type="button" className="btn btn-ghost" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

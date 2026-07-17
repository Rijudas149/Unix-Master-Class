import { useState, useEffect, useRef } from 'react';

function formatTime(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const cs = Math.floor((ms % 1000) / 10);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

export function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startRef = useRef(0);
  const accRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now();
    const id = setInterval(() => {
      setElapsed(accRef.current + Date.now() - startRef.current);
    }, 10);
    return () => clearInterval(id);
  }, [running]);

  const start = () => setRunning(true);
  const pause = () => {
    accRef.current += Date.now() - startRef.current;
    setRunning(false);
  };
  const reset = () => {
    setRunning(false);
    accRef.current = 0;
    setElapsed(0);
  };

  return (
    <div className="widget stopwatch-widget">
      <div className="widget-label">Stopwatch</div>
      <div className="timer-display">{formatTime(elapsed)}</div>
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

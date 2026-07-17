import { useState, useEffect } from 'react';

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="widget clock-widget">
      <div className="widget-label">Clock</div>
      <div className="clock-time">
        {time.toLocaleTimeString('en-IN', { hour12: true })}
      </div>
      <div className="clock-date">
        {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
    </div>
  );
}

import { Clock } from '../components/widgets/Clock'
import { Stopwatch } from '../components/widgets/Stopwatch'
import { Timer } from '../components/widgets/Timer'
import { Calendar } from '../components/widgets/Calendar'

export function Tools() {
  return (
    <div className="page tools-page">
      <header className="page-header">
        <h1>Study Tools</h1>
        <p>Clock, calendar, stopwatch, and timer to structure your Unix/Linux study sessions.</p>
      </header>

      <div className="tools-grid">
        <Clock />
        <Calendar />
        <Stopwatch />
        <Timer />
      </div>

        <section className="tools-tips section">
        <h2>Study Tips</h2>
        <ul>
          <li>Use the <strong>Timer</strong> for Pomodoro sessions (25 min study, 5 min break).</li>
          <li>Use the <strong>Stopwatch</strong> to track how long you spend on each command topic.</li>
          <li>Press <strong>Ctrl+K</strong> anywhere to search commands, lessons, and scenarios instantly.</li>
          <li>Bookmark lessons and scenarios with the ☆ Save button — they appear on your Dashboard.</li>
          <li>Build a daily streak by completing sections or marking practice questions as done.</li>
        </ul>
      </section>
    </div>
  )
}

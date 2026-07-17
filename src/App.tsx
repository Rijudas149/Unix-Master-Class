import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ProgressProvider } from './context/ProgressContext'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Learn } from './pages/Learn'
import { TopicLesson } from './pages/TopicLesson'
import { Practice } from './pages/Practice'
import { Facts } from './pages/Facts'
import { FactScenarioPage } from './pages/FactScenario'
import { Tools } from './pages/Tools'
import { Reference } from './pages/Reference'
import './index.css'

function App() {
  return (
    <ThemeProvider>
      <ProgressProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="learn" element={<Learn />} />
              <Route path="learn/:topicId" element={<TopicLesson />} />
              <Route path="reference" element={<Reference />} />
              <Route path="practice" element={<Practice />} />
              <Route path="facts" element={<Facts />} />
              <Route path="facts/:scenarioId" element={<FactScenarioPage />} />
              <Route path="tools" element={<Tools />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProgressProvider>
    </ThemeProvider>
  )
}

export default App

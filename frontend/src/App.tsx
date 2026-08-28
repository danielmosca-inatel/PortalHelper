import { Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { ClassesPage } from './pages/ClassesPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ClassesPage />} />
          <Route
            path="/grades"
            element={
              <PlaceholderPage
                title="Grades"
                description="View and register student grades."
              />
            }
          />
          <Route
            path="/exams"
            element={
              <PlaceholderPage
                title="Exam Dates"
                description="Institutional exam calendar per class."
              />
            }
          />
          <Route
            path="/attendance"
            element={
              <PlaceholderPage
                title="Attendance"
                description="Attendance records feeding the AI performance evaluation."
              />
            }
          />
          <Route
            path="/assistant"
            element={
              <PlaceholderPage
                title="AI Assistant"
                description="Natural-language chat over classes, grades, exams and attendance."
              />
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App

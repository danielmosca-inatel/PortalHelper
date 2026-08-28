import express from 'express'
import { env } from './lib/env.js'
import { attendanceRouter } from './routes/attendance.js'
import { classesRouter } from './routes/classes.js'
import { examsRouter } from './routes/exams.js'
import { gradesRouter } from './routes/grades.js'

const app = express()
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/classes', classesRouter)
app.use('/api/grades', gradesRouter)
app.use('/api/exams', examsRouter)
app.use('/api/attendance', attendanceRouter)

app.listen(env.port, () => {
  console.log(`backend listening on http://localhost:${env.port}`)
})

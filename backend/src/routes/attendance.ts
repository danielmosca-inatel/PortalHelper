import { Router } from 'express'

export const attendanceRouter = Router()

// Mock data until the portal-automation service (discovery spike) is wired in.
attendanceRouter.get('/:classId', (req, res) => {
  res.json([
    { studentId: '1', name: 'João Silva', present: 18, absent: 2 },
    { studentId: '2', name: 'Maria Souza', present: 15, absent: 5 },
  ])
})

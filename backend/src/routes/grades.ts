import { Router } from 'express'

export const gradesRouter = Router()

// Mock data until the portal-automation service (discovery spike) is wired in.
gradesRouter.get('/:classId', (req, res) => {
  res.json([
    { studentId: '1', name: 'João Silva', grade: 8.5 },
    { studentId: '2', name: 'Maria Souza', grade: 7.2 },
  ])
})

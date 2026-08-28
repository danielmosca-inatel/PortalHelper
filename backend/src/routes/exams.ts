import { Router } from 'express'

export const examsRouter = Router()

// Mock data until the portal-automation service (discovery spike) is wired in.
examsRouter.get('/:classId', (req, res) => {
  res.json([{ title: 'Prova 1', date: '2026-09-15' }])
})

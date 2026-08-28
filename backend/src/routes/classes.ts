import { Router } from 'express'

export const classesRouter = Router()

// Mock data until the portal-automation service (discovery spike) is wired in.
classesRouter.get('/', (_req, res) => {
  res.json([
    { id: '1', name: 'Algoritmos I', students: 42 },
    { id: '2', name: 'Estrutura de Dados', students: 38 },
  ])
})

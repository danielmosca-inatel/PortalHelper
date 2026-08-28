// Structured Playwright automation layer for the institutional portal.
// See DISCOVERY.md at the repo root for the page map and selector notes
// this is built from. Route handlers call functions from here instead of
// returning mock data, once each page's read/write path is mapped.

import { chromium, type Browser, type Page } from 'playwright'
import { env } from '../lib/env.js'

const BASE_URL = 'https://siteseguro.inatel.br/PortalAcademico'
const MENU_URL = `${BASE_URL}/Docentes/WebMenuDocente.aspx`

export async function launchBrowser(): Promise<Browser> {
  return chromium.launch({ headless: true })
}

// Logs a fresh page into the "Área Acadêmica" (staff) tab using
// PORTAL_USERNAME / PORTAL_PASSWORD from the environment, then navigates
// on to the Docente menu (a fresh login lands on a generic role hub,
// WebServicoAcademico.aspx, not the Docente area directly). Never logs
// or returns the credential values.
export async function login(page: Page): Promise<void> {
  if (!env.portalUsername || !env.portalPassword) {
    throw new Error('PORTAL_USERNAME / PORTAL_PASSWORD are not set (see backend/.env.example)')
  }

  await page.goto(`${BASE_URL}/WebLogin.aspx`)
  await page.getByRole('link', { name: 'Área Acadêmica' }).click()
  // The tab click likely triggers an async UpdatePanel postback that
  // re-renders the panel; filling before it settles has been observed to
  // get silently wiped by the server's response ~50% of the time. Wait for
  // network activity to quiet down, not just for the field to be visible.
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Usuário da rede').fill(env.portalUsername)
  await page.getByLabel('Senha da rede').fill(env.portalPassword)
  await page.getByRole('button', { name: 'Continuar' }).click()

  await page.getByRole('link', { name: 'Sair' }).waitFor({ timeout: 15_000 })

  if (!page.url().startsWith(MENU_URL)) {
    await page.goto(MENU_URL)
  }
}

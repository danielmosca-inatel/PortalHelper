// Manual smoke test for the portal login flow.
// Run with: npm run test-login  (after filling in backend/.env)
// Prints only success/failure — never the credential values.

import { launchBrowser, login } from '../services/portalAutomation.js'

const browser = await launchBrowser()
try {
  const page = await browser.newPage()
  await login(page)
  console.log('✅ login succeeded — reached', page.url())
} catch (err) {
  console.error('❌ login failed:', err instanceof Error ? err.message : err)
  const page = browser.contexts()[0]?.pages()[0]
  if (page) {
    await page.screenshot({ path: '/tmp/test-login-landing.png' })
    console.error('landed on', page.url(), '— screenshot: /tmp/test-login-landing.png')
  }
  process.exitCode = 1
} finally {
  await browser.close()
}

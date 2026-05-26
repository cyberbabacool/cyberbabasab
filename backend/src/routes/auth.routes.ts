import { Router, Request, Response } from 'express'
import {
  isSetupDone, setupUser, verifyCredentials,
  generateToken, setAuthCookie, clearAuthCookie, requireAuth, loadConfig
} from '../auth.js'

const router = Router()

router.get('/status', (_req: Request, res: Response) => {
  res.json({ setupDone: isSetupDone() })
})

router.post('/setup', async (req: Request, res: Response) => {
  if (isSetupDone()) { res.status(403).json({ error: 'Already configured' }); return }
  const { username, password } = req.body
  if (!username || !password || password.length < 8) {
    res.status(400).json({ error: 'Username required and password must be at least 8 characters' }); return
  }
  await setupUser(username, password)
  const token = generateToken(username)
  setAuthCookie(res, token)
  res.json({ ok: true })
})

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body
  const ok = await verifyCredentials(username, password)
  if (!ok) { res.status(401).json({ error: 'Invalid credentials' }); return }
  const token = generateToken(username)
  setAuthCookie(res, token)
  res.json({ ok: true })
})

router.post('/logout', (_req: Request, res: Response) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

router.get('/me', requireAuth, (req: Request, res: Response) => {
  const cfg = loadConfig()
  res.json({ username: cfg?.username ?? 'user' })
})

router.post('/change-password', requireAuth, async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body
  const cfg = loadConfig()
  if (!cfg) { res.status(500).json({ error: 'No config' }); return }
  const ok = await verifyCredentials(cfg.username, currentPassword)
  if (!ok) { res.status(401).json({ error: 'Wrong current password' }); return }
  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters' }); return
  }
  await setupUser(cfg.username, newPassword)
  res.json({ ok: true })
})

export default router

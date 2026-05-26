import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const CONFIG_PATH = process.env.CONFIG_PATH || '/config/auth.json'
const JWT_SECRET = process.env.JWT_SECRET || 'cyberbabasab-secret-change-me'
const JWT_EXPIRES = '7d'
const COOKIE_NAME = 'cbs_token'

export interface AuthConfig {
  username: string
  passwordHash: string
  setupDone: boolean
}

export function loadConfig(): AuthConfig | null {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
    }
  } catch {}
  return null
}

export function saveConfig(cfg: AuthConfig): void {
  const dir = path.dirname(CONFIG_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2))
}

export function isSetupDone(): boolean {
  const cfg = loadConfig()
  return !!(cfg && cfg.setupDone)
}

export async function setupUser(username: string, password: string): Promise<void> {
  const passwordHash = await bcrypt.hash(password, 12)
  saveConfig({ username, passwordHash, setupDone: true })
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const cfg = loadConfig()
  if (!cfg || !cfg.setupDone) return false
  if (cfg.username !== username) return false
  return bcrypt.compare(password, cfg.passwordHash)
}

export function generateToken(username: string): string {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  })
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: '/' })
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return }
  try {
    jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

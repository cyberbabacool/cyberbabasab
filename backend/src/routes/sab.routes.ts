import { Router, Request, Response } from 'express'
import multer from 'multer'
import * as sab from '../services/sab.service.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } })

const h = (fn: (req: Request, res: Response) => Promise<any>) =>
  async (req: Request, res: Response) => {
    try { res.json(await fn(req, res)) }
    catch (e: any) { res.status(500).json({ error: e.message }) }
  }

// Queue
router.get('/queue',   h(() => sab.getQueue()))
router.get('/history', h((req) => sab.getHistory(Number(req.query.limit) || 100)))
router.get('/config',  h(() => sab.getConfig()))
router.get('/status',  h(() => sab.getStatus()))

router.get('/pause',   h(() => sab.pauseQueue()))
router.get('/resume',  h(() => sab.resumeQueue()))
router.get('/speedlimit', h((req) => sab.setSpeedLimit(Number(req.query.value))))
router.get('/complete-action', h((req) => sab.setCompleteAction(req.query.value as string)))

router.get('/job/pause',    h((req) => sab.pauseJob(req.query.nzo_id as string)))
router.get('/job/resume',   h((req) => sab.resumeJob(req.query.nzo_id as string)))
router.get('/job/delete',   h((req) => sab.deleteJob(req.query.nzo_ids as string, Number(req.query.del_files) || 0)))
router.get('/job/move',     h((req) => sab.moveJob(req.query.nzo_id as string, Number(req.query.position))))
router.get('/job/cat',      h((req) => sab.changeCat(req.query.nzo_id as string, req.query.value as string)))
router.get('/job/priority', h((req) => sab.changePrio(req.query.nzo_id as string, Number(req.query.value))))
router.get('/job/rename',   h((req) => sab.renameJob(req.query.nzo_id as string, req.query.name as string, req.query.password as string)))
router.get('/job/files',    h((req) => sab.getFiles(req.query.nzo_id as string)))
router.get('/job/retry',    h((req) => sab.retryJob(req.query.nzo_id as string, req.query.password as string)))

router.get('/purge',          h(() => sab.purgeQueue()))
router.get('/history/delete', h((req) => sab.deleteHistory(req.query.nzo_ids as string)))

router.post('/addnzb', upload.single('nzbfile'), async (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ error: 'No file' }); return }
  try { res.json(await sab.addNzb(req.file.buffer, req.file.originalname, req.body.cat ?? '')) }
  catch (e: any) { res.status(500).json({ error: e.message }) }
})

router.get('/addurl',   h((req) => sab.addUrl(req.query.url as string, req.query.cat as string)))
router.get('/addlocal', h((req) => sab.addLocal(req.query.name as string, req.query.cat as string)))

// Config save/delete
router.get('/config/save', h((req) =>
  sab.saveConfig(req.query.section as string, req.query.keyword as string, req.query.value as string)
))
router.get('/config/delete', h((req) =>
  sab.deleteConfig(req.query.section as string, req.query.keyword as string)
))

// Servers
router.post('/servers/add', h((req) => sab.addServer(req.body)))
router.post('/servers/edit', h((req) => sab.addServer(req.body)))
router.get('/servers/delete', h((req) => sab.deleteServer(req.query.servername as string)))
router.get('/servers/test',   h((req) => sab.testServer(req.query.servername as string)))

// Categories
router.post('/categories/add',  h((req) => sab.addCategory(req.body)))
router.post('/categories/edit', h((req) => sab.addCategory(req.body)))
router.get('/categories/delete', h((req) => sab.deleteCategory(req.query.name as string)))

// RSS
router.get('/rss',        h(() => sab.getConfig()))
router.get('/rss/read',   h((req) => sab.readRssFeed(req.query.feed as string)))
router.post('/rss/add',   h((req) => sab.addRssFeed(req.body)))
router.get('/rss/delete', h((req) => sab.deleteRssFeed(req.query.name as string)))

// Misc
router.get('/shutdown', h(() => sab.shutdown()))
router.get('/restart',  h(() => sab.restart()))
router.get('/pause_pp', h(() => sab.pausePostProcessing()))
router.get('/resume_pp', h(() => sab.resumePostProcessing()))

export default router

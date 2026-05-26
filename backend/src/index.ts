import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import cookieParser from 'cookie-parser'
import { Server } from 'socket.io'
import sabRoutes from './routes/sab.routes.js'
import authRoutes from './routes/auth.routes.js'
import { requireAuth } from './auth.js'
import { getQueue } from './services/sab.service.js'

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(cookieParser())

// Auth routes (public)
app.use('/auth', authRoutes)

// SABnzbd API routes (protected)
app.use('/api', requireAuth, sabRoutes)

io.on('connection', socket => {
  console.log('Client connected')
})

setInterval(async () => {
  try {
    const queue = await getQueue()
    io.emit('queue-update', queue)
  } catch {}
}, 2000)

server.listen(process.env.PORT, () => {
  console.log('CyberbabaSAB backend running on port ' + process.env.PORT)
})

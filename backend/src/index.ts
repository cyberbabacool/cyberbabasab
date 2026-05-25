import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import sabRoutes from './routes/sab.routes.js'
import { getQueue } from './services/sab.service.js'

dotenv.config()

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

app.use(cors())
app.use(express.json())

app.use('/api', sabRoutes)

io.on('connection', socket => {
  console.log('Client connected')
})

setInterval(async () => {
  try {
    const queue = await getQueue()
    io.emit('queue-update', queue)
  } catch (err) {
    console.error(err)
  }
}, 2000)

server.listen(process.env.PORT, () => {
  console.log('NebulaSAB backend running')
})

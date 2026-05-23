const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' }
})

const rooms = {}

io.on('connection', (socket) => {
  console.log('Device connected:', socket.id)

  socket.on('create-room', (pin) => {
    rooms[pin] = socket.id
    socket.join(pin)
    console.log('Room created with PIN:', pin)
  })

  socket.on('join-room', (pin) => {
    if (rooms[pin]) {
      socket.join(pin)
      io.to(pin).emit('viewer-joined')
      console.log('Viewer joined PIN:', pin)
    } else {
      socket.emit('invalid-pin')
    }
  })

  socket.on('screen-data', (data) => {
    socket.to(data.pin).emit('screen-data', data.image)
  })

  socket.on('disconnect', () => {
    console.log('Device disconnected:', socket.id)
  })
})

server.listen(3000, () => {
  console.log('Server running on port 3000')
})
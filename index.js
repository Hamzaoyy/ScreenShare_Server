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
  console.log('Connected:', socket.id)

  socket.on('create-room', (pin) => {
    rooms[pin] = socket.id
    socket.join(pin)
    console.log('Room created:', pin)
  })

  socket.on('join-room', (pin) => {
    if (rooms[pin]) {
      socket.join(pin)
      io.to(rooms[pin]).emit('viewer-joined', socket.id)
      socket.emit('room-joined', rooms[pin])
    } else {
      socket.emit('invalid-pin')
    }
  })

  socket.on('offer', (data) => {
    io.to(data.target).emit('offer', { sdp: data.sdp, from: socket.id })
  })

  socket.on('answer', (data) => {
    io.to(data.target).emit('answer', { sdp: data.sdp, from: socket.id })
  })

  socket.on('ice-candidate', (data) => {
    io.to(data.target).emit('ice-candidate', { candidate: data.candidate, from: socket.id })
  })

  socket.on('disconnect', () => {
    for (const pin in rooms) {
      if (rooms[pin] === socket.id) delete rooms[pin]
    }
  })
})

server.listen(process.env.PORT || 3000, () => {
  console.log('Server running!')
})
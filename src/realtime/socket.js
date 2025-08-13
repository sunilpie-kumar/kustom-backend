import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

let ioInstance = null

export const initSocket = (server, corsOptions = {}) => {
  const io = new Server(server, {
    cors: {
      origin: corsOptions.origin || '*',
      credentials: true,
    },
  })

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1]
      if (!token) return next()
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
      if (decoded.userId) {
        socket.user = { type: 'user', id: decoded.userId }
      } else if (decoded.providerId) {
        socket.user = { type: 'provider', id: decoded.providerId }
      }
      next()
    } catch (err) {
      next()
    }
  })

  io.on('connection', (socket) => {
    // Personal room for direct notifications
    if (socket.user) {
      socket.join(`${socket.user.type}:${socket.user.id}`)
    }

    socket.on('chat:join', ({ conversationId }) => {
      if (conversationId) socket.join(`conversation:${conversationId}`)
    })

    socket.on('chat:typing', ({ conversationId, isTyping = true }) => {
      if (!conversationId) return
      // prevent echo back to sender by using rooms and leaving sender out is non-trivial here; client filters by convo id and ignores own type
      io.to(`conversation:${conversationId}`).emit('chat:typing', { conversationId, from: socket.user, isTyping })
    })

    socket.on('disconnect', () => {})
  })

  ioInstance = io
  return io
}

export const getIO = () => ioInstance


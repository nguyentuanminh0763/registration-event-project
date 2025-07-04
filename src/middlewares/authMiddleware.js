import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'

const authenToken = (req, res, next) => {
  // 'Beaer [token]'
  const authorizationHeader = req.headers['authorization']

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Missing or malformed token' })
  }

  const token = authorizationHeader.split(' ')[1]
  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'NO token' })
  }

  jwt.verify(token, env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: 'Invalid or expired token' })
    }

    req.user = decoded // lưu payload vào req.user để dùng ở controller
    next()
  })
}

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(StatusCodes.FORBIDDEN).json({ error: 'Admin access only' })
  }
  next()
}

const isStudent = (req, res, next) => {
  if (req.user?.role !== 'student') {
    return res.status(StatusCodes.FORBIDDEN).json({ error: 'Student access only' })
  }
  next()
}

export const authMiddleware = {
  authenToken,
  isAdmin,
  isStudent
}
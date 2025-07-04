import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'

export const genarateAccessToken = (payload) => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' })
}


export const genarateRefreshToken = (payload) => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}
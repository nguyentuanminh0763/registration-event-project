import express from 'express'
import { env } from '~/config/environment'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { connectDB } from '~/config/database'
import authRoutes from '~/routes/authRoutes'
import registrationRoutes from '~/routes/registrationRoutes'
import path from 'path'

const START_SERVER = () => {
  const app = express()

  // Cấu hình view engine EJS mà không cần __dirname
  app.set('view engine', 'ejs')
  app.set('views', path.resolve(process.cwd(), 'src/views')) // thư mục chứa login.ejs...

  // Cho phép gửi form và JSON
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())

  // Serve static assets (nếu cần)
  app.use(express.static(path.resolve(process.cwd(), 'src/public')))

  // Routes
  app.use('/api/auth', authRoutes)
  app.use('/api/registration', registrationRoutes)

  // Middleware xử lý lỗi
  app.use(errorHandlingMiddleware)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Hello ${env.AUTHOR}, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`)
  })
}

// Khởi động khi kết nối DB xong
;(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas')
    await connectDB()
    console.log('2. Connected to MongoDB Cloud Atlas')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

import express from 'express'
import { authController } from '~/controllers/authController.js'
import { authValidation } from '~/validations/authValidation.js'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

router.post('/register', authValidation.registerByPhone, authController.registerByPhone)
router.post('/login', authController.login)
router.get('/login', authController.renderLoginPage)
router.get('/dashboard', authMiddleware.authenToken, authMiddleware.isStudent, authController.renderDashboardPage)


export default router

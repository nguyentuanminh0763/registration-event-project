import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { registrationController } from '~/controllers/registrationController'

const router = express.Router()

router.post('/registrations', authMiddleware.authenToken, authMiddleware.isStudent, registrationController.registerForEvent)
router.delete('/registrations/:registrationId', authMiddleware.authenToken, registrationController.unregisterFromEvent)
router.get('/listRegistrations', authMiddleware.authenToken, authMiddleware.isAdmin, registrationController.listRegistrations)
router.get('/getRegistrationsByDate', authMiddleware.authenToken, authMiddleware.isAdmin, registrationController.getRegistrationsByDate)

router.get('/registerEvent', authMiddleware.authenToken, authMiddleware.isStudent, registrationController.getRegisterEventPage)
router.get('/cancelRegistration', authMiddleware.authenToken, authMiddleware.isStudent, registrationController.getCancelRegistrationPage)

// Hiển thị form tìm kiếm
router.get('/search-registrations', (req, res) => {
  res.render('searchRegistrations') // chỉ hiển thị form
})


export default router

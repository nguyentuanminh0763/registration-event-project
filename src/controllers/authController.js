import bcrypt from 'bcrypt'
import User from '~/models/UserModel'
import { StatusCodes } from 'http-status-codes'
import { genarateAccessToken } from '~/utils/genarateTokens'
import Registration from '~/models/registrationModel'
import Event from '~/models/eventModel'

const registerByPhone = async (req, res) => {
  try {
    const { phone, password } = req.body

    const existingUser = await User.findOne({ phone })
    if (existingUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Số điện thoại đã được đăng ký' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({ phone, password: hashedPassword })
    await newUser.save()

    res.status(201).json({ message: 'Tạo tài khoản thành công' })
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message })
  }
}

const login = async (req, res) => {
  const { phone, password } = req.body

  const currentUser = await User.findOne({ phone })
  if (!currentUser) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Số điện thoại chua đăng ký' })
  }

  if (!(await bcrypt.compare(password, currentUser.password))) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Sai MK' })
  }

  const payload = {
    _id: currentUser._id,
    role: currentUser.role,
    phone: currentUser.phone
  }

  const accessToken = genarateAccessToken(payload)

  console.log('accessToken:', accessToken)
  // res.json({ accessToken, payload })
  if (payload.role === 'admin') {
    // Lấy dữ liệu thật cho dashboard admin
    const totalEvents = await Event.countDocuments()
    const totalRegistrations = await Registration.countDocuments()
    const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(5)
    const recentRegistrations = await Registration.find()
      .sort({ registrationDate: -1 })
      .limit(5)
      .populate('eventId', 'name')
      .populate('studentId', 'phone')

    return res.render('adminDashboard', {
      user: payload,
      token: accessToken,
      stats: { totalEvents, totalRegistrations },
      recentEvents,
      recentRegistrations
    })
  } else {
    return res.render('dashboard', { user: payload, token: accessToken })
  }

}

const renderLoginPage = (req, res) => {
  res.render('login', { error: null })
}

const renderDashboardPage = (req, res) => {
  res.render('dashboard', { user: req.user }) // user là payload từ token
}


export const authController = {
  registerByPhone,
  login,
  renderLoginPage,
  renderDashboardPage
}

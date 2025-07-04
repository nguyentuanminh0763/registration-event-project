import Registration from '../models/registrationModel.js'
import Event from '../models/eventModel.js'

const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body
    const studentId = req.user._id // Đã có từ middleware xác thực

    // 1. Tìm sự kiện
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Sự kiện không tồn tại.' })
    }

    // 2. Đếm số lượt đăng ký hiện tại của sự kiện đó
    const currentRegistrations = await Registration.countDocuments({ eventId })

    if (currentRegistrations >= event.capacity) {
      return res.status(400).json({ error: 'Sự kiện đã đủ người.' })
    }

    // 3. Kiểm tra trùng đăng ký
    const existing = await Registration.findOne({ eventId, studentId })
    if (existing) {
      return res.status(400).json({ error: 'Bạn đã đăng ký sự kiện này rồi.' })
    }

    // 4. Tạo bản ghi đăng ký
    const newRegistration = new Registration({
      eventId,
      studentId
    })

    await newRegistration.save()

    res.status(201).json({ message: 'Đăng ký thành công!', registration: newRegistration })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const unregisterFromEvent = async (req, res) => {
  try {
    const { registrationId } = req.params
    const studentId = req.user._id

    // Tìm bản ghi đăng ký
    const registration = await Registration.findById(registrationId)

    if (!registration) {
      return res.status(404).json({ error: 'Không tìm thấy đăng ký.' })
    }

    // Kiểm tra người huỷ có phải là người đã đăng ký không
    if (registration.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({ error: 'Bạn không có quyền hủy đăng ký này.' })
    }

    // Xóa bản ghi
    await Registration.findByIdAndDelete(registrationId)

    res.json({ message: 'Hủy đăng ký thành công.' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}


const listRegistrations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const skip = (page - 1) * limit

    const total = await Registration.countDocuments()

    const registrations = await Registration.find()
      .skip(skip)
      .limit(limit)
      .populate('studentId', 'phone')
      .populate('eventId', 'name date location')
      .sort({ registrationDate: -1 })

    const totalPages = Math.ceil(total / limit)

    res.render('listRegistrations', {
      currentPage: page,
      totalPages,
      data: registrations
    })
  } catch (err) {
    res.status(500).send('Lỗi khi tải danh sách đăng ký')
  }
}


const getRegistrationsByDate = async (req, res) => {
  try {
    const { start, end } = req.query

    if (!start || !end) {
      return res.status(400).json({ error: 'Vui lòng cung cấp cả ngày bắt đầu và kết thúc.' })
    }

    const startDate = new Date(start)
    const endDate = new Date(end)

    if (startDate > endDate) {
      return res.status(400).json({ error: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc.' })
    }

    const registrations = await Registration.find({
      registrationDate: { $gte: startDate, $lte: endDate }
    }).populate('studentId', 'username')
      .populate('eventId', 'name date')

    if (registrations.length === 0) {
      return res.status(200).json({ message: 'Không có đăng ký nào trong khoảng thời gian này.' })
    }

    res.status(200).json({ total: registrations.length, data: registrations })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getRegisterEventPage = async (req, res) => {
  try {
    const events = await Event.find({})

    const enrichedEvents = await Promise.all(events.map(async (event) => {
      const registeredCount = await Registration.countDocuments({ eventId: event._id })
      return { ...event._doc, registeredCount }
    }))

    res.render('registerEvent', { events: enrichedEvents })
  } catch (error) {
    res.status(500).send('Lỗi khi tải trang đăng ký sự kiện')
  }
}

const getCancelRegistrationPage = async (req, res) => {
  try {
    const registrations = await Registration.find({ studentId: req.user._id })
      .populate('eventId', 'name date location')
      .sort({ registrationDate: -1 })

    res.render('cancelRegistration', { registrations })
  } catch (error) {
    res.status(500).send('Lỗi khi tải trang huỷ đăng ký')
  }
}


export const registrationController = {
  registerForEvent,
  unregisterFromEvent,
  listRegistrations,
  getRegistrationsByDate,
  getRegisterEventPage,
  getCancelRegistrationPage
}

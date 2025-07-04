import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

const registerByPhone = async (req, res, next) => {
  const correctCondition = Joi.object({
    phone: Joi.string()
      .trim()
      .strict()
      .pattern(/^0[0-9]{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Số điện thoại không đúng định dạng',
        'any.required': 'Số điện thoại là bắt buộc'
      }),
    password: Joi.string()
      .trim()
      .strict()
      .min(6)
      .required()
      .messages({
        'string.min': 'Mật khẩu phải ít nhất 6 ký tự',
        'any.required': 'Mật khẩu là bắt buộc'
      })
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(error).message
    })
  }
}


export const authValidation = {
  registerByPhone
}

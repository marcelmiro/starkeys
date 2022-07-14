import Mailgun from 'mailgun.js'
import formData from 'form-data'

const key = process.env.MAILGUN_API_KEY as string
export const domain = process.env.MAILGUN_DOMAIN as string
export const fromAddress = process.env.MAILGUN_FROM_ADDRESS as string

export const mailgun = new Mailgun(formData).client({ username: 'api', key })

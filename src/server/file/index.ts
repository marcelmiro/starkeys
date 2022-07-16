import { UploadClient } from '@uploadcare/upload-client'

const publicKey = process.env.UPLOADCARE_PUBLIC_KEY as string
export const baseUrl = process.env.UPLOADCARE_BASE_URL as string

export const fileUpload = new UploadClient({ publicKey })

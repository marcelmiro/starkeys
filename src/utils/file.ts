import { UploadClient } from '@uploadcare/upload-client'

const publicKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY as string
const baseUrl = process.env.NEXT_PUBLIC_UPLOADCARE_BASE_URL as string

const fileUpload = new UploadClient({ publicKey })

interface UploadFile {
	file: File
	fileName?: string
	contentType?: string
}

export async function uploadFile({
	file,
	fileName = 'original',
	contentType,
}: UploadFile) {
	const options = { fileName, contentType }
	const res = await fileUpload.uploadFile(file, options)
	return `${baseUrl}${res.uuid}/${fileName}`
}

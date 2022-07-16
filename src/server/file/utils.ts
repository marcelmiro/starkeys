import { fileUpload, baseUrl } from './index'

interface UploadFile {
	file: string
	fileName?: string
	contentType?: string
}

export async function uploadFile({
	file,
	fileName = 'original',
	contentType,
}: UploadFile) {
	const buffer = Buffer.from(file, 'base64')
	const options = { contentType, fileName }
	const res = await fileUpload.uploadFile(buffer, options)
	return `${baseUrl}${res.uuid}/${fileName}`
}

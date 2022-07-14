import { customAlphabet } from 'nanoid/async'

const alphabet =
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const nanoid = customAlphabet(alphabet)

export function generateId(length: number) {
	return nanoid(length)
}

/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from '@prisma/client'
import { generateId } from '../src/utils/id'

const REFERRAL_CODE_LENGTH = Number(process.env.REFERRAL_CODE_LENGTH)

const prisma = new PrismaClient()

async function main() {
	const referralCode = await generateId(REFERRAL_CODE_LENGTH)

	const input = {
		referralCode,
		email: 'hello@world.com',
		// referrerId: 2
	}

	const res = await prisma.user.create({ data: input })
	console.log(res)
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

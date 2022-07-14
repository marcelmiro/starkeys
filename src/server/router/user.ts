import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

import { createRouter } from './context'
import { verifyReferralCode } from '../db/utils'
import { insertUserToNotion } from '../notion/utils'
import { generateId } from '../../utils/id'
import { sendWelcomeEmail } from '../email/utils'

const BASE_URL = process.env.BASE_URL as string
const REFERRAL_CODE_LENGTH = Number(process.env.REFERRAL_CODE_LENGTH)

export const userRouter = createRouter()
	.query('verifyReferralCode', {
		input: z.object({
			referralCode: z
				.string()
				.min(3, 'Invalid referral code')
				.max(16, 'Invalid referral code'),
		}),
		async resolve({ ctx, input: { referralCode } }) {
			const user = await verifyReferralCode(ctx, referralCode)
			return Boolean(user)
		},
	})
	.mutation('add', {
		input: z.object({
			referralCode: z
				.string()
				.min(3, 'Invalid referral code')
				.max(16, 'Invalid referral code'),
			name: z
				.string()
				.min(3, 'Name must be at least 3 characters long')
				.max(200, 'Name cannot exceed 200 characters'),
			email: z.string().email('Invalid email'),
			bio: z
				.string()
				.min(20, 'Bio must be at least 20 characters long')
				.max(2000, 'Bio cannot exceed 2000 characters'),
		}),
		async resolve({ ctx, input }) {
			const [referralCode, referrer] = await Promise.all([
				generateId(REFERRAL_CODE_LENGTH),
				verifyReferralCode(ctx, input.referralCode),
			])

			const referralUrl = `${BASE_URL}join?code=${referralCode}`

			try {
				await ctx.prisma.user.create({
					data: {
						referralCode,
						email: input.email,
						referrerId: referrer.id,
					},
				})
			} catch (e) {
				if (e instanceof Prisma.PrismaClientKnownRequestError) {
					if (e.code === 'P2002')
						throw new TRPCError({
							code: 'BAD_REQUEST',
							message: 'Email is already in use',
						})
				}
				throw e
			}

			try {
				await Promise.all([
					sendWelcomeEmail({
						referralUrl,
						name: input.name,
						email: input.email,
					}),
					insertUserToNotion({
						name: input.name,
						email: input.email,
						bio: input.bio,
					}),
				])
			} catch (e) {
				await ctx.prisma.user
					.delete({ where: { email: input.email } })
					.catch(() => {})
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'An unexpected error occurred',
				})
			}

			return true
		},
	})

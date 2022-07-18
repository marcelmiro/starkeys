import { TRPCError } from '@trpc/server'
import { Context } from '../router/context'

const MAX_REFERREES = Number(process.env.MAX_REFERREES)

export async function verifyReferralCode(ctx: Context, referralCode: string) {
	const user = await ctx.prisma.user.findFirst({
		where: { referralCode },
		include: { referree: true },
	})

	if (!user)
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Referral code not found',
		})

	if (!user.unlimitedReferrals && user.referree.length >= MAX_REFERREES)
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'Referral code has expired',
		})

	return user
}

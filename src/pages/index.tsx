import { useState, useEffect } from 'react'
import Router from 'next/router'

import { trpc, parseErrorMessage } from '../utils/trpc'
import ErrorMessage from '../components/ErrorMessage'
import styles from '../styles/home.module.scss'

// const JOIN_SUBSTRING = '/join?code='

export default function Home() {
	const [referralCode, setReferralCode] = useState('')

	const { data, isLoading, refetch, error } = trpc.useQuery(
		['user.verifyReferralCode', { referralCode }],
		{ enabled: false, retry: false }
	)

	function join() {
		if (Boolean(error) || isLoading || referralCode.length === 0) return
		/* let code = referralCode
		if (code.includes(JOIN_SUBSTRING))
			code = code.slice(
				code.indexOf(JOIN_SUBSTRING) + JOIN_SUBSTRING.length
			) */
		refetch()
	}

	useEffect(() => {
		if (!data) return
		Router.push(`/join?code=${referralCode}`)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data])

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>StarKeys</h1>

			<div className={styles.inputGroup}>
				<div className={styles.inputContainer}>
					<input
						value={referralCode}
						onChange={(e) => setReferralCode(e.target.value)}
						type="text"
						placeholder="Referral code"
						className={styles.input}
						onKeyPress={(e) => e.key === 'Enter' && join()}
					/>
					<button
						disabled={
							Boolean(error) ||
							isLoading ||
							referralCode.length === 0
						}
						className={styles.button}
						onClick={join}
					>
						Join
					</button>
				</div>

				<ErrorMessage message={parseErrorMessage(error)} />
			</div>
		</div>
	)
}

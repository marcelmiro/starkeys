import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'

import { trpc, parseErrorMessage } from '../utils/trpc'
import LandingPage from '../components/LandingPage'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import styles from '../styles/home.module.scss'

export default function Home() {
	const [referralCode, setReferralCode] = useState('')
	const [isFirstLoad, setIsFirstLoad] = useState(true)

	const {
		isReady: isRouterReady,
		query: { code },
	} = useRouter()

	const { data, isLoading, refetch, error } = trpc.useQuery(
		['user.verifyReferralCode', { referralCode }],
		{ enabled: false, retry: false }
	)

	const join = useMemo(
		() => () => {
			if (Boolean(error) || isLoading || referralCode.length === 0) return
			refetch()
		},
		[error, isLoading, referralCode, refetch]
	)

	useEffect(() => {
		if (!isFirstLoad || !isRouterReady) return
		if (data || error || !code || typeof code !== 'string') {
			setIsFirstLoad(false)
			return
		}
		if (!referralCode) setReferralCode(code.replace(/\W/g, ''))
		refetch()
	}, [code, isRouterReady, isFirstLoad, referralCode, refetch, data, error])

	const Content = useMemo(() => {
		if (isFirstLoad) return <LoadingSpinner className={styles.loader} />
		if (data) return <LandingPage applyUrl={`/join?code=${referralCode}`} />
		return (
			<div className={styles.container}>
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
	}, [referralCode, data, error, isLoading, isFirstLoad, join])

	return Content
}

import { useState } from 'react'
import Router from 'next/router'

import styles from '../styles/home.module.scss'

const JOIN_SUBSTRING = '/join?code='

export default function Home() {
	const [referralCode, setReferralCode] = useState('')

	function join() {
		if (!referralCode || referralCode.length === 0) return
		let code = referralCode
		if (code.includes(JOIN_SUBSTRING))
			code = code.slice(
				code.indexOf(JOIN_SUBSTRING) + JOIN_SUBSTRING.length
			)
		Router.push(`/join?code=${code}`)
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>StarKeys</h1>
			<div className={styles.inputGroup}>
				<input
					value={referralCode}
					onChange={(e) => setReferralCode(e.target.value)}
					type="text"
					placeholder="Referral code"
					className={styles.input}
					onKeyPress={(e) => e.key === 'Enter' && join()}
				/>
				<button
					disabled={referralCode.length === 0}
					className={styles.button}
					onClick={join}
				>
					Join
				</button>
			</div>
		</div>
	)
}

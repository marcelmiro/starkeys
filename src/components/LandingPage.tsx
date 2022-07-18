import Link from 'next/link'

import SkeletonImage from './SkeletonImage'
import ArrowHead from '../../public/arrowhead.svg'
import KeyIcon from '../../public/key.svg'
import TicketIcon from '../../public/ticket.svg'
import NetworkIcon from '../../public/network.svg'
import styles from '../styles/LandingPage.module.scss'

interface LandingPageProps {
	applyUrl: string
}

const currentYear = new Date().getFullYear()

export default function LandingPage({ applyUrl }: LandingPageProps) {
	return (
		<div className={styles.container}>
			<div className={styles.main}>
				<div className={styles.mainContent}>
					<h1 className={styles.title}>
						Get access to opportunities from the{' '}
						<strong>fastest growing companies</strong>
					</h1>

					<p className={styles.subtitle}>
						Congratulations on reaching stage 1, someone within our
						network nominated you to be in the top 5% of talent. Now
						it&apos;s your time to prove your worth.
					</p>

					<Link href={applyUrl}>
						<a target="_self" className={styles.button}>
							<span>Apply now</span>
							<ArrowHead />
						</a>
					</Link>
				</div>

				<div className={styles.mainImageContainer}>
					<SkeletonImage
						src="/office.jpg"
						alt="Recruitment image"
						className={styles.mainImage}
						objectFit="cover"
					/>
				</div>
			</div>

			<div className={styles.about}>
				<h2 className={styles.heading}>
					What is <strong>StarKeys</strong>?
				</h2>

				<div className={styles.aboutContent}>
					<div className={styles.aboutItem}>
						<KeyIcon />
						<p>
							Get access to personalized job matches and
							opportunities
						</p>
					</div>

					<div className={styles.aboutItem}>
						<TicketIcon />
						<p>
							Attend insightful exclusive events hosted by
							industry experts
						</p>
					</div>

					<div className={styles.aboutItem}>
						<NetworkIcon />
						<p>
							Connect with talents, investors, and employers on
							global scale
						</p>
					</div>
				</div>
			</div>

			<div className={styles.footer}>
				<hr className={styles.hr} />

				<div className={styles.copyright}>
					<span>© {currentYear} StarKeys LLC</span>
					<span>All rights reserved.</span>
				</div>
			</div>
		</div>
	)
}

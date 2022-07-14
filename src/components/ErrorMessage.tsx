import ExclamationIcon from '../../public/exclamation.svg'
import styles from '../styles/InputGroup.module.scss'

interface ErrorMessageProps {
	message?: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
	if (!message) return null

	return (
		<div className={styles.error}>
			<ExclamationIcon />
			<span role="alert">{message}</span>
		</div>
	)
}

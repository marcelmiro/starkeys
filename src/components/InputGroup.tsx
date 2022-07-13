import { useRef } from 'react'

import ExclamationIcon from '../../public/exclamation.svg'
import styles from '../styles/InputGroup.module.scss'

interface InputGroupProps {
	label: string
	id: string
	value: string
	onChange(val: string): void
	error?: string
	textarea?: boolean
	minHeight?: string
}

export default function InputGroup({
	label,
	id,
	value,
	onChange,
	error,
	textarea,
	minHeight,
}: InputGroupProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	function handleChange(
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) {
		onChange(e.target.value)
		if (textarea) updateTextAreaHeight()
	}

	function updateTextAreaHeight() {
		const el = textareaRef.current
		if (!el) return
		el.style.height = 'inherit'
		el.style.height = el.scrollHeight + 2 + 'px'
	}

	return (
		<div>
			<label htmlFor={id} className={styles.label}>
				{label}
			</label>

			{!textarea ? (
				<input
					value={value}
					onChange={handleChange}
					type="text"
					placeholder={label}
					id={id}
					className={styles.input}
				/>
			) : (
				<textarea
					value={value}
					onChange={handleChange}
					placeholder={label}
					className={styles.input}
					ref={textareaRef}
					style={{ minHeight }}
				></textarea>
			)}

			{error && (
				<div className={styles.error}>
					<ExclamationIcon />
					<span role="alert">{error}</span>
				</div>
			)}
		</div>
	)
}

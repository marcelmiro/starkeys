import { useRef, HTMLInputTypeAttribute } from 'react'

import ErrorMessage from './ErrorMessage'
import styles from '../styles/InputGroup.module.scss'

interface InputGroupProps {
	label: string
	id: string
	value?: string
	onChange?(val: string): void
	error?: string
	inputType?: HTMLInputTypeAttribute
	textarea?: boolean
	minHeight?: string
	maxLength?: number
	children?: React.ReactNode
}

export default function InputGroup({
	label,
	id,
	value,
	onChange,
	error,
	inputType = 'text',
	textarea,
	minHeight,
	maxLength,
	children,
}: InputGroupProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	function handleChange(
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) {
		onChange?.(e.target.value)
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

			{children ||
				(!textarea ? (
					<input
						value={value}
						onChange={handleChange}
						type={inputType}
						placeholder={label}
						id={id}
						className={styles.input}
						maxLength={maxLength}
					/>
				) : (
					<textarea
						value={value}
						onChange={handleChange}
						placeholder={label}
						className={styles.input}
						ref={textareaRef}
						style={{ minHeight }}
						maxLength={maxLength}
					></textarea>
				))}

			<ErrorMessage message={error} />
		</div>
	)
}

export function encodeFile(file: File) {
	const fileReader = new FileReader()
	return new Promise<string>((resolve, reject) => {
		fileReader.onload = function (e) {
			const res = e.target?.result
			if (res) {
				resolve(
					res
						.toString()
						.replace(/^data:application\/pdf;base64,/g, '')
				)
			} else reject('File not read')
		}
		fileReader.onerror = reject
		fileReader.readAsDataURL(file)
	})
}

import { notion, databaseId } from './index'

interface CreateUserProps {
	name: string
	email: string
	socialUrls: string
	phone: string
	roles: string[]
	resume: string
}

export function insertUserToNotion({
	name,
	email,
	socialUrls,
	phone,
	roles,
	resume,
}: CreateUserProps) {
	const payload = {
		parent: { type: 'database_id', database_id: databaseId },
		properties: {
			Name: {
				title: [{ text: { content: name } }],
			},
			Email: { email },
			'Social URLs': {
				rich_text: [{ text: { content: socialUrls } }],
			},
			Phone: {
				rich_text: [{ text: { content: phone } }],
			},
			Roles: {
				multi_select: roles.map((role) => ({ name: role })),
			},
			'CV/Resume': {
				files: [
					{
						type: 'external',
						name: 'CV/Resume',
						external: { url: resume },
					},
				],
			},
		},
	}

	// @ts-ignore-next-line
	return notion.pages.create(payload)
}

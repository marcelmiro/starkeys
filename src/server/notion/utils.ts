import { TRPCError } from '@trpc/server'
import { notion, databaseId } from './index'

interface CreateUserProps {
	name: string
	email: string
	bio: string
}

export function insertUserToNotion({ name, email, bio }: CreateUserProps) {
	if (!databaseId)
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: "Environmental variable 'NOTION_DATABASE_ID' not found",
		})

	const payload = {
		parent: { database_id: databaseId },
		properties: {
			Name: {
				title: [{ text: { content: name } }],
			},
			Email: { email },
			Bio: {
				rich_text: [{ text: { content: bio } }],
			},
		},
	}

	return notion.pages.create(payload)
}

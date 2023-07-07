import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(), // 'id' is the column name
  fullName: text('full_name'),
  age: integer('age'),
})

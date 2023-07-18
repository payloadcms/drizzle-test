import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
})

export const posts_my_array_field = sqliteTable('posts_my_array_field', {
  id: integer('id').primaryKey(),
  locale: text('locale'),
  subField: text('sub_field'),
  order: integer('order'),
  postID: integer("posts_id").references(() => posts.id),
})

export const posts_locales = sqliteTable('posts_locales', {
  id: integer('id').primaryKey(),
  locale: text('locale'),
  title: text('title'),
  number: integer('number'),
  postID: integer('post_id').references(() => posts.id)
})

export const postsRelations = relations(posts, ({ many }) => ({
  _locales: many(posts_locales),
  myArrayField: many(posts_my_array_field),
}));

export const postsLocalesRelations = relations(posts_locales, ({ one }) => ({
  postID: one(posts, {
    fields: [posts_locales.postID],
    references: [posts.id],
  })
}))

export const postsMyArrayFieldRelations = relations(posts_my_array_field, ({ one }) => ({
  postsID: one(posts, {
    fields: [posts_my_array_field.postID],
    references: [posts.id],
  })
}))
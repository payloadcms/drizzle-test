import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
})

export const posts_relationships = sqliteTable('posts_relationships', {
  id: integer('id').primaryKey(),
  parent: integer('parent_id').references(() => posts.id).notNull(),
  path: text('path').notNull(),
  order: integer('order'),
  pagesID: integer('pages_id').references(() => pages.id),
  peopleID: integer('people_id').references(() => people.id),
})

export const posts_locales = sqliteTable('posts_locales', {
  id: integer('id').primaryKey(),
  _locale: text('_locale').notNull(),
  title: text('title'),
  number: integer('number'),
  _postID: integer('_post_id')
    .references(() => posts.id)
    .notNull(),
})

export const posts_my_array = sqliteTable('posts_my_array', {
  id: integer('id').primaryKey(),
  _locale: text('_locale'),
  _order: integer('_order'),
  _postID: integer('_posts_id').references(() => posts.id),
})

export const posts_my_array_locales = sqliteTable('posts_my_array_locales', {
  id: integer('id').primaryKey(),
  _locale: text('_locale').notNull(),
  subField: text('sub_field'),
  _postMyArrayID: integer('post_my_array_id')
    .references(() => posts_my_array.id)
    .notNull(),
})

export const people = sqliteTable('people', {
  id: integer('id').primaryKey(),
  fullName: text('full_name'),
})

export const pages = sqliteTable('pages', {
  id: integer('id').primaryKey(),
  slug: text('slug'),
})

export const postsRelations = relations(posts, ({ many }) => ({
  _relationships: many(posts_relationships),
  _locales: many(posts_locales),
  myArray: many(posts_my_array),
}))

export const postsRelationshipsRelations = relations(posts_relationships, ({ one }) => ({
  parent: one(posts, {
    fields: [posts_relationships.parent],
    references: [posts.id],
  }),
  pagesID: one(pages, {
    fields: [posts_relationships.pagesID],
    references: [pages.id],
  }),
  peopleID: one(people, {
    fields: [posts_relationships.peopleID],
    references: [people.id],
  })
}))

export const postsLocalesRelations = relations(posts_locales, ({ one }) => ({
  _postID: one(posts, {
    fields: [posts_locales._postID],
    references: [posts.id],
  }),
}))

export const postsMyArrayRelations = relations(posts_my_array, ({ one, many }) => ({
  _postsID: one(posts, {
    fields: [posts_my_array._postID],
    references: [posts.id],
  }),
  _locales: many(posts_my_array_locales),
}))

export const postsMyArrayLocalesRelations = relations(
  posts_my_array_locales,
  ({ one }) => ({
    _postsMyArrayID: one(posts_my_array, {
      fields: [posts_my_array_locales._postMyArrayID],
      references: [posts_my_array.id],
    }),
  }),
)

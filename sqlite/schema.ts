import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
  email: text('email')
})

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
  myGroup_subField: text('my_group_sub_field'),
  myGroup_subGroup_subSubField: text('my_group_sub_group_sub_sub_field'),
})

export const posts_relationships = sqliteTable('posts_relationships', {
  id: integer('id').primaryKey(),
  parent: integer('parent_id').references(() => posts.id).notNull(),
  path: text('path').notNull(),
  order: integer('order'),
  postsID: integer('posts_id').references(() => posts.id),
  pagesID: integer('pages_id').references(() => pages.id),
  peopleID: integer('people_id').references(() => people.id),
  usersID: integer('users_id').references(() => users.id),
})

export const posts_locales = sqliteTable('posts_locales', {
  id: integer('id').primaryKey(),
  _locale: text('_locale').notNull(),
  title: text('title'),
  number: integer('number'),
  myGroup_subFieldLocalized: text('my_group_sub_field_localized'),
  myGroup_subGroup_subSubFieldLocalized: text('my_group_sub_group_sub_sub_field_localized'),
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
    relationName: 'parent',
    fields: [posts_relationships.parent],
    references: [posts.id],
  }),
  postsID: one(posts, {
    relationName: 'postsID',
    fields: [posts_relationships.postsID],
    references: [posts.id],
  }),
  pagesID: one(pages, {
    fields: [posts_relationships.pagesID],
    references: [pages.id],
  }),
  peopleID: one(people, {
    fields: [posts_relationships.peopleID],
    references: [people.id],
  }),
  usersID: one(users, {
    fields: [posts_relationships.usersID],
    references: [users.id],
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

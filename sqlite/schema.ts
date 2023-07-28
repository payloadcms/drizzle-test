import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

const createRelationships = (table) => ({
  id: integer('id').primaryKey(),
  parent: integer('parent_id').references(() => table.id).notNull(),
  path: text('path').notNull(),
  order: integer('order'),
  postsID: integer('posts_id').references(() => posts.id),
  pagesID: integer('pages_id').references(() => pages.id),
  peopleID: integer('people_id').references(() => people.id),
  usersID: integer('users_id').references(() => users.id),
})

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

export const people = sqliteTable('people', {
  id: integer('id').primaryKey(),
  fullName: text('full_name'),
})

export const pages = sqliteTable('pages', {
  id: integer('id').primaryKey(),
  slug: text('slug'),
})

export const posts_relationships = sqliteTable('posts_relationships', createRelationships(posts))
export const users_relationships = sqliteTable('users_relationships', createRelationships(users))
export const pages_relationships = sqliteTable('pages_relationships', createRelationships(pages))

export const people_relationships = sqliteTable('people_relationships', createRelationships(people))

export const posts_locales = sqliteTable('posts_locales', {
  id: integer('id').primaryKey(),
  _locale: text('_locale').notNull(),
  title: text('title'),
  number: integer('number'),
  myGroup_subFieldLocalized: text('my_group_sub_field_localized'),
  myGroup_subGroup_subSubFieldLocalized: text('my_group_sub_group_sub_sub_field_localized'),
  _parentID: integer('_parent_id')
    .references(() => posts.id)
    .notNull(),
})

export const posts_my_array = sqliteTable('posts_my_array', {
  id: integer('id').primaryKey(),
  _locale: text('_locale'),
  _order: integer('_order').notNull(),
  _parentID: integer('_parent_id').references(() => posts.id),
})

export const posts_my_array_my_sub_array = sqliteTable('posts_my_array_my_sub_array', {
  id: integer('id').primaryKey(),
  _locale: text('_locale'),
  _order: integer('_order').notNull(),
  _parentID: integer('_parent_id').references(() => posts_my_array.id),
  subSubField: text('sub_sub_field'),
})

export const posts_my_group_group_array = sqliteTable('posts_my_group_group_array', {
  id: integer('id').primaryKey(),
  _locale: text('_locale'),
  _order: integer('_order').notNull(),
  _parentID: integer('_parent_id').references(() => posts.id),
  groupArrayText: text('group_array_text'),
})

export const posts_block1 = sqliteTable('posts_block1', {
  id: integer('id').primaryKey(),
  nonLocalizedText: text('non_localized_text'),
  _path: text('_path').notNull(),
  _locale: text('_locale'),
  _order: integer('_order').notNull(),
  _parentID: integer('_parent_id').references(() => posts.id),
})

export const posts_block1_locales = sqliteTable('posts_block1_locales', {
  id: integer('id').primaryKey(),
  localizedText: text('localized_text'),
  _locale: text('_locale').notNull(),
  _parentID: integer('_parent_id')
    .references(() => posts_block1.id)
    .notNull(),
})

export const posts_block2 = sqliteTable('posts_block2', {
  id: integer('id').primaryKey(),
  number: integer('number'),
  _path: text('_path').notNull(),
  _locale: text('_locale'),
  _order: integer('_order'),
  _parentID: integer('_parent_id').references(() => posts.id),
})

export const posts_my_array_locales = sqliteTable('posts_my_array_locales', {
  id: integer('id').primaryKey(),
  _locale: text('_locale').notNull(),
  subField: text('sub_field'),
  _parentID: integer('_parent_id')
    .references(() => posts_my_array.id)
    .notNull(),
})


export const postsRelations = relations(posts, ({ many }) => ({
  _relationships: many(posts_relationships, {
    relationName: '_relationships'
  }),
  _locales: many(posts_locales),
  _blocks_block1: many(posts_block1),
  _blocks_block2: many(posts_block2),
  myArray: many(posts_my_array),
  myGroup_groupArray: many(posts_my_group_group_array),
}))

export const pagesRelations = relations(pages, ({ many }) => ({
  _relationships: many(pages_relationships, {
    relationName: '_relationships'
  }),
}))

export const peopleRelations = relations(people, ({ many }) => ({
  _relationships: many(people_relationships, {
    relationName: '_relationships'
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  _relationships: many(users_relationships, {
    relationName: '_relationships'
  }),
}))

export const createRelationshipsRelations = (table, relations_table) => ({ one }) => ({
  parent: one(table, {
    relationName: '_relationships',
    fields: [relations_table.parent],
    references: [table.id],
  }),
  postsID: one(posts, {
    fields: [relations_table.postsID],
    references: [posts.id],
  }),
  pagesID: one(pages, {
    fields: [relations_table.pagesID],
    references: [pages.id],
  }),
  peopleID: one(people, {
    fields: [relations_table.peopleID],
    references: [people.id],
  }),
  usersID: one(users, {
    fields: [relations_table.usersID],
    references: [users.id],
  })
})

export const postsRelationshipsRelations = relations(posts_relationships, createRelationshipsRelations(posts, posts_relationships))
export const pagesRelationshipsRelations = relations(pages_relationships, createRelationshipsRelations(pages, pages_relationships))
export const peopleRelationshipsRelations = relations(people_relationships, createRelationshipsRelations(people, people_relationships))
export const usersRelationshipsRelations = relations(users_relationships, createRelationshipsRelations(users, users_relationships))

export const postsLocalesRelations = relations(posts_locales, ({ one }) => ({
  _parentID: one(posts, {
    fields: [posts_locales._parentID],
    references: [posts.id],
  }),
}))

export const postsMyArrayRelations = relations(posts_my_array, ({ one, many }) => ({
  _parentID: one(posts, {
    fields: [posts_my_array._parentID],
    references: [posts.id],
  }),
  _locales: many(posts_my_array_locales),
  mySubArray: many(posts_my_array_my_sub_array),
}))

export const postsMyArrayMySubArrayRelations = relations(posts_my_array_my_sub_array, ({ one, many }) => ({
  _parentID: one(posts_my_array, {
    fields: [posts_my_array_my_sub_array._parentID],
    references: [posts_my_array.id],
  }),
}))

export const postsMyGroupGroupArrayRelations = relations(posts_my_group_group_array, ({ one }) => ({
  _parentID: one(posts, {
    fields: [posts_my_group_group_array._parentID],
    references: [posts.id],
  }),
}))

export const postsMyArrayLocalesRelations = relations(
  posts_my_array_locales,
  ({ one }) => ({
    _parentID: one(posts_my_array, {
      fields: [posts_my_array_locales._parentID],
      references: [posts_my_array.id],
    }),
  }),
)

export const postsBlock1Relations = relations(posts_block1, ({ one, many }) => ({
  _parentID: one(posts, {
    fields: [posts_block1._parentID],
    references: [posts.id],
  }),
  _locales: many(posts_block1_locales),
}))

export const postsBlock1LocalesRelations = relations(
  posts_block1_locales,
  ({ one }) => ({
    _parentID: one(posts_block1, {
      fields: [posts_block1_locales._parentID],
      references: [posts_block1.id],
    }),
  }),
)

export const postsBlock2Relations = relations(posts_block2, ({ one, many }) => ({
  _parentID: one(posts, {
    fields: [posts_block2._parentID],
    references: [posts.id],
  }),
}))

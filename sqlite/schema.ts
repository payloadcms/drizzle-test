import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
  relationHasOne: integer('relation_has_one').references(() => pages.id),
  // relationHasOnePoly: integer('relation_has_one'),
  // relationHasOnePolyType: text('relation_has_one_poly_type')
})

export const postsRelationHasOnePoly = sqliteTable('posts_relation_has_one_poly', {
  id: integer('id').primaryKey(),
  pagesID: integer('pages_id').references(() => pages.id),
  peopleID: integer('people_id').references(() => people.id),
  _postsID: integer('_posts_id').references(() => posts.id),
})

export const postsRelationHasMany = sqliteTable('posts_relation_has_many', {
  id: integer('id').primaryKey(),
  pagesID: integer('pages_id').references(() => pages.id),
  _postsID: integer('_posts_id').references(() => posts.id).notNull(),
  _order: integer('_order').notNull(),
})

export const posts_locales = sqliteTable('posts_locales', {
  id: integer('id').primaryKey(),
  _locale: text('_locale').notNull(),
  title: text('title'),
  number: integer('number'),
  _postID: integer('_post_id').references(() => posts.id).notNull()
})

export const posts_my_array_field = sqliteTable('posts_my_array_field', {
  id: integer('id').primaryKey(),
  _locale: text('_locale'),
  _order: integer('_order'),
  _postID: integer("_posts_id").references(() => posts.id),
})

export const posts_my_array_field_locales = sqliteTable('posts_my_array_field_locales', {
  id: integer('id').primaryKey(),
  _locale: text('_locale').notNull(),
  subField: text('sub_field'),
  _postMyArrayFieldID: integer('post_my_array_field_id').references(() => posts_my_array_field.id).notNull()
})

export const people = sqliteTable('people', {
  id: integer('id').primaryKey(),
  fullName: text('full_name'),
})

export const pages = sqliteTable('pages', {
  id: integer('id').primaryKey(),
  slug: text('slug'),
})

export const postsRelations = relations(posts, ({ many, one }) => ({
  relationHasOne: one(pages, {
    fields: [posts.relationHasOne],
    references: [pages.id],
  }),
  relationHasMany: many(postsRelationHasMany),
  _locales: many(posts_locales),
  myArrayField: many(posts_my_array_field),
}));

export const postsRelationsHasOnePoly = relations(postsRelationHasOnePoly, ({ many }) => ({
    relationHasOnePolyPeople: many(postsRelationHasOnePoly),
    // relationHasOnePolyPeople: many(people, {
    //   fields: [postsRelationHasOnePoly.peopleID],
    //   references: [people.id],
    // }),
    // relationHasOnePolyPages: many(pages, {
    //   fields: [postsRelationHasOnePoly.pagesID],
    //   references: [pages.id],
    // }),
  })
)

export const postsRelationHasManyRelations = relations(postsRelationHasMany, ({ one }) => ({
  _postsID: one(posts, {
    fields: [postsRelationHasMany._postsID],
    references: [posts.id],
  }),
  pageID: one(pages, {
    fields: [postsRelationHasMany.pagesID],
    references: [pages.id],
  })
}))

export const postsLocalesRelations = relations(posts_locales, ({ one }) => ({
  _postID: one(posts, {
    fields: [posts_locales._postID],
    references: [posts.id],
  })
}))

export const postsMyArrayFieldRelations = relations(posts_my_array_field, ({ one, many }) => ({
  _postsID: one(posts, {
    fields: [posts_my_array_field._postID],
    references: [posts.id],
  }),
  _locales: many(posts_my_array_field_locales),
}))

export const postsMyArrayFieldLocalesRelations = relations(posts_my_array_field_locales, ({ one }) => ({
  _postsMyArrayFieldID: one(posts_my_array_field, {
    fields: [posts_my_array_field_locales._postMyArrayFieldID],
    references: [posts_my_array_field.id]
  })
}))

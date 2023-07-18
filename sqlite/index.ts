import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import * as schema from './schema'

const sqlite = new Database('db.sqlite')
const db = drizzle(sqlite, { schema })

migrate(db, { migrationsFolder: './migrations' })

const {
  pages,
  people,
  posts,
  postsRelationHasMany,
  posts_locales,
  posts_my_array_field,
  posts_my_array_field_locales
} = schema

const start = async () => {
  const pagesRes = db.insert(pages).values([
    { slug: 'first' },
    { slug: 'second' }
  ]).returning().all()

  const peopleRes = db.insert(people).values([
    { fullName: 'Dan Ribbens' },
    { fullName: 'Elliot DeNolf' }
  ]).returning().all()

  // Create the post first
  // QUESTION
  // Do we have to use `returning().get()` here? What is `get()`?
  const post = db.insert(posts).values({
    createdAt: new Date(),
    updatedAt: new Date(),
    relationHasOne: pagesRes[0].id
  }).returning().get()

  // Add hasMany relations
  db.insert(postsRelationHasMany).values([
    { pagesID: pagesRes[0].id, _postsID: post.id, _order: 1, },
    { pagesID: pagesRes[1].id, _postsID: post.id, _order: 2, },
  ]).returning().all()

  // Then create localized content
  // QUESTION
  // Do we have to run these insert operations separately? Will there be nested insert?
  // We'd like to run this alongside of the above posts insert
  db.insert(posts_locales).values([
    { _locale: 'en', title: 'hello', number: 1337, _postID: post.id },
    { _locale: 'es', title: 'hola', number: 42069, _postID: post.id }
  ]).returning().get()

  // Then create a few rows for the array field (localized)
  // QUESTION
  // Is there a better way to order these rows, without having to store an order field?
  const arrayRows = db.insert(posts_my_array_field).values([
    { _order: 1, _postID: post.id, _locale: 'en' },
    { _order: 2, _postID: post.id, _locale: 'en' }
  ]).returning().all()

  // There is a localized subfield to populate on the array fields
  // so we need to grab that as well
  db.insert(posts_my_array_field_locales).values([
    { _postMyArrayFieldID: arrayRows[0].id, subField: 'hello 1', _locale: 'en' },
    { _postMyArrayFieldID: arrayRows[1].id, subField: 'hello 2', _locale: 'en' },
  ]).returning().get()

  // Now we can make one query to get docs with locales and array fields
  const result = db.query.posts.findMany({
    with: {
      relationHasOne: true,
      relationHasMany: {
        orderBy: ({ _order }, { asc }) => [asc(_order)],
        columns: {
          _order: false,
          id: false,
          _postsID: false,
        }
      },
      _locales: {
        where: ({ _locale }, { eq }) => eq(_locale, 'en'),
        columns: {
          id: false,
          _postID: false,
          _locale: false,
        }
      },
      myArrayField: {
        orderBy: ({ _order }, { asc }) => [asc(_order)],
        columns: {
          _postID: false,
          _order: false,
          _locale: false,
        },
        with: {
          _locales: {
            where: ({ _locale }, { eq }) => eq(_locale, 'en'),
            columns: {
              id: false,
              _postMyArrayFieldID: false,
              _locale: false,
            }
          }
        }
      }
    },
  })

  console.dir(result, { depth: null })
}

start()
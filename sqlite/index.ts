import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import * as schema from './schema'

const sqlite = new Database('db.sqlite')
const db = drizzle(sqlite, { schema })

migrate(db, { migrationsFolder: './migrations' })

const { posts, posts_locales, posts_my_array_field } = schema

const start = async () => {

  // Create the post first
  // QUESTION
  // Do we have to use `returning().get()` here? What is `get()`?
  const post = db.insert(posts).values({ createdAt: new Date(), updatedAt: new Date() }).returning().get()

  // Then create localized content
  // QUESTION
  // Do we have to run these insert operations separately? Will there be nested insert?
  // We'd like to run this alongside of the above posts insert
  db.insert(posts_locales).values([
    { locale: 'en', title: 'hello', number: 1337, postID: post.id },
    { locale: 'es', title: 'hola', number: 42069, postID: post.id }
  ]).returning().get()

  // Then create a few rows for the array field (localized)
  // QUESTION
  // Is there a better way to order these rows, without having to store an order field?
  db.insert(posts_my_array_field).values([
    { order: 1, subField: 'hello 1', postID: post.id, locale: 'en' },
    { order: 2, subField: 'hello 2', postID: post.id, locale: 'en' }
  ]).returning().get()

  // Now we can make one query to get docs with locales and array fields
  const result = db.query.posts.findMany({
    with: {
      _locales: {
        where: ({ locale }, { eq }) => eq(locale, 'en'),
        columns: {
          id: false,
          postID: false,
        }
      },
      myArrayField: {
        orderBy: ({ order }, { desc }) => [desc(order)],
      }
    },
  })

  console.dir(result, { depth: null })
}

start()
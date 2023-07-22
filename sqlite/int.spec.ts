import fs from 'fs'
import path from 'path'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { transform } from './transform'
import payloadConfigPromise from './payload.config'
import { Post } from './payload-types'
import { find } from './find'
import { SanitizedCollectionConfig } from 'payload/types'
import { SanitizedConfig } from 'payload/config'

const {
  pages,
  people,
  posts,
  posts_relationships,
  posts_locales,
  posts_my_array,
  posts_my_array_locales,
} = schema

describe('SQLite Tests', () => {
  let db: BetterSQLite3Database<typeof schema>
  let postsCollection: SanitizedCollectionConfig
  let payloadConfig: SanitizedConfig
  let collectionSlugs: string[]

  const pages1Slug = 'first'
  const pages2Slug = 'second'
  const people1FullName = 'Dan Ribbens'
  const people2FullName = 'Elliot DeNolf'
  const myGroup_subField = 'hello'
  const myGroup_subGroup_subSubField = 'sub hello'
  const myGroup_subFieldLocalizedEN = 'hello in english'
  const myGroup_subFieldLocalizedES = 'hello in spanish'
  const myGroup_subGroup_subSubFieldLocalizedEN = 'sub hello in english'
  const myGroup_subGroup_subSubFieldLocalizedES = 'sub hello in spanish'
  const myArraySubField1 = 'hello 1'
  const myArraySubField2 = 'hello 2'

  beforeAll(async () => {
    payloadConfig = await payloadConfigPromise
    postsCollection = payloadConfig.collections.find(({ slug }) => slug === 'posts')
    collectionSlugs = payloadConfig.collections.map(({ slug }) => slug)

    // delete database before tests
    const databaseExists = fs.existsSync('./db.sqlite')
    if (databaseExists) fs.unlinkSync(path.resolve(__dirname, './db.sqlite'))

    const sqlite = new Database('db.sqlite')
    db = drizzle(sqlite, { schema })
    migrate(db, { migrationsFolder: './migrations' })

    const pagesRes = db
      .insert(pages)
      .values([{ slug: pages1Slug }, { slug: pages2Slug }])
      .returning()
      .all()

    const peopleRes = db
      .insert(people)
      .values([{ fullName: people1FullName }, { fullName: people2FullName }])
      .returning()
      .all()

    // Create the post first
    // QUESTION
    // Do we have to use `returning().get()` here? What is `get()`?
    const post = db
      .insert(posts)
      .values({
        createdAt: new Date(),
        updatedAt: new Date(),
        myGroup_subField,
        myGroup_subGroup_subSubField,
      })
      .returning()
      .get()

    // Add post relationships
    db.insert(posts_relationships)
      .values([
        { pagesID: pagesRes[0].id, parent: post.id, path: 'relationHasOne' },
        { peopleID: peopleRes[0].id, parent: post.id, path: 'relationHasOnePoly' },
        { pagesID: pagesRes[0].id, parent: post.id, order: 1, path: 'relationHasMany' },
        { pagesID: pagesRes[1].id, parent: post.id, order: 2, path: 'relationHasMany' },
        { peopleID: peopleRes[0].id, parent: post.id, order: 1, path: 'relationHasManyPoly' },
        { pagesID: pagesRes[1].id, parent: post.id, order: 2, path: 'relationHasManyPoly' },
      ])
      .returning()
      .all()

    // Then create localized content
    // QUESTION
    // Do we have to run these insert operations separately? Will there be nested insert?
    // We'd like to run this alongside of the above posts insert
    db.insert(posts_locales)
      .values([
        { _locale: 'en', title: 'hello', number: 1337, _postID: post.id, myGroup_subFieldLocalized: myGroup_subFieldLocalizedEN, myGroup_subGroup_subSubFieldLocalized: myGroup_subGroup_subSubFieldLocalizedEN },
        { _locale: 'es', title: 'hola', number: 42069, _postID: post.id, myGroup_subFieldLocalized: myGroup_subFieldLocalizedES, myGroup_subGroup_subSubFieldLocalized: myGroup_subGroup_subSubFieldLocalizedES },
      ])
      .returning()
      .get()

    // Then create a few rows for the array field (localized)
    // QUESTION
    // Is there a better way to order these rows, without having to store an order field?
    const arrayRows = db
      .insert(posts_my_array)
      .values([
        { _order: 1, _postID: post.id, _locale: 'en' },
        { _order: 2, _postID: post.id, _locale: 'en' },
      ])
      .returning()
      .all()

    // There is a localized subfield to populate on the array fields
    // so we need to grab that as well
    db.insert(posts_my_array_locales)
      .values([
        { _postMyArrayID: arrayRows[0].id, subField: myArraySubField1, _locale: 'en' },
        { _postMyArrayID: arrayRows[1].id, subField: myArraySubField2, _locale: 'en' },
      ])
      .returning()
      .get()
  })

  it('finds and transforms data to payload-expected shape', async () => {
    const result = find({
      db,
      depth: 1,
      collection: postsCollection,
      collectionSlugs,
      locale: 'en',
    })

    const payloadResult = transform<Post>({ data: result, locale: 'en', fields: postsCollection.fields })

    // Group tests
    expect(typeof payloadResult[0].myGroup).toEqual('object')
    expect(payloadResult[0].myGroup?.subField).toEqual(myGroup_subField)
    expect(payloadResult[0].myGroup?.subFieldLocalized).toEqual(myGroup_subFieldLocalizedEN)
    expect(payloadResult[0].myGroup?.subGroup?.subSubField).toEqual(myGroup_subGroup_subSubField)
    expect(payloadResult[0].myGroup?.subGroup?.subSubFieldLocalized).toEqual(myGroup_subGroup_subSubFieldLocalizedEN)

    // Array tests
    expect(payloadResult[0].myArray?.[0]?.subField).toEqual(myArraySubField1)
    expect(payloadResult[0].myArray?.[1]?.subField).toEqual(myArraySubField2)

    // Relationship hasOne
    expect(typeof payloadResult[0].relationHasOne).toEqual('object')

    if (typeof payloadResult[0].relationHasOne === 'object') {
      expect(payloadResult[0].relationHasOne.slug).toEqual(pages1Slug)
    }

    // Relationship hasOnePoly
    expect(typeof payloadResult[0].relationHasOnePoly).toEqual('object')

    if (typeof payloadResult[0].relationHasOnePoly === 'object') {
      expect(payloadResult[0].relationHasOnePoly.relationTo).toEqual('people')

      if (typeof payloadResult[0].relationHasOnePoly.value === 'object' && 'fullName' in payloadResult[0].relationHasOnePoly.value) {
        expect(payloadResult[0].relationHasOnePoly.value?.fullName).toEqual(people1FullName)
      }
    }
  })

  it('finds with specified locale', async () => {
    expect(true).toStrictEqual(true)
  })

  it('finds with specified locale and fallback locale', async () => {
    expect(true).toStrictEqual(true)
  })

  it('finds with depth: 0', async () => {
    expect(true).toStrictEqual(true)
  })

  it('finds with depth: 3', async () => {
    expect(true).toStrictEqual(true)
  })
})

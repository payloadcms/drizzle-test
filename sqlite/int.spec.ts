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
  posts_my_array_my_sub_array,
  posts_my_group_group_array,
  posts_block1,
  posts_block1_locales,
  posts_block2,
} = schema

describe('SQLite Tests', () => {
  let db: BetterSQLite3Database<typeof schema>
  let postsCollection: SanitizedCollectionConfig
  let payloadConfig: SanitizedConfig

  const pages1Slug = 'first'
  const pages2Slug = 'second'
  const people1FullName = 'Dan Ribbens'
  const people2FullName = 'Elliot DeNolf'
  const postTitleEN = 'hello'
  const postTitleES = 'hola'
  const myGroup_subField = 'hello'
  const myGroup_subGroup_subSubField = 'sub hello'
  const myGroup_subFieldLocalizedEN = 'hello in english'
  const myGroup_subFieldLocalizedES = 'hello in spanish'
  const myGroup_subGroup_subSubFieldLocalizedEN = 'sub hello in english'
  const myGroup_subGroup_subSubFieldLocalizedES = 'sub hello in spanish'
  const myGroup_groupArray_row1Text = 'group array row 1'
  const myGroup_groupArray_row2Text = 'group array row 2'
  const myArraySubField1 = 'hello 1'
  const myArraySubField2 = 'hello 2'
  const subSubFieldRow1SubRow1 = 'row 1 subrow 1'
  const subSubFieldRow1SubRow2 = 'row 1 subrow 2'
  const subSubFieldRow2SubRow1 = 'row 2 subrow 1'
  const subSubFieldRow2SubRow2 = 'row 2 subrow 2'

  beforeAll(async () => {
    payloadConfig = await payloadConfigPromise
    postsCollection = payloadConfig.collections.find(({ slug }) => slug === 'posts')

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
        { postsID: post.id, parent: post.id, path: 'selfReferencingRelationship' },
      ])
      .returning()
      .all()

    // Then create localized content
    // QUESTION
    // Do we have to run these insert operations separately? Will there be nested insert in Drizzle?
    // We'd like to run this alongside of the above posts insert
    db.insert(posts_locales)
      .values([
        { _locale: 'en', title: postTitleEN, number: 1337, _parentID: post.id, myGroup_subFieldLocalized: myGroup_subFieldLocalizedEN, myGroup_subGroup_subSubFieldLocalized: myGroup_subGroup_subSubFieldLocalizedEN },
        { _locale: 'es', title: postTitleES, number: 42069, _parentID: post.id, myGroup_subFieldLocalized: myGroup_subFieldLocalizedES, myGroup_subGroup_subSubFieldLocalized: myGroup_subGroup_subSubFieldLocalizedES },
      ])
      .returning()
      .get()

    // Then create a few rows for the array field (localized)
    // QUESTION
    // Is there a better way to order these rows, without having to store an order field?
    const arrayRows = db
      .insert(posts_my_array)
      .values([
        { _order: 1, _parentID: post.id, _locale: 'en' },
        { _order: 2, _parentID: post.id, _locale: 'en' },
      ])
      .returning()
      .all()

    db
      .insert(posts_my_array_my_sub_array)
      .values([
        { _order: 1, _parentID: arrayRows[0].id, _locale: 'en', subSubField: subSubFieldRow1SubRow1 },
        { _order: 2, _parentID: arrayRows[0].id, _locale: 'en', subSubField: subSubFieldRow1SubRow2 },
        { _order: 1, _parentID: arrayRows[1].id, _locale: 'en', subSubField: subSubFieldRow2SubRow1 },
        { _order: 2, _parentID: arrayRows[1].id, _locale: 'en', subSubField: subSubFieldRow2SubRow2 },
      ])
      .returning()
      .all()


    db
      .insert(posts_my_group_group_array)
      .values([
        { _order: 1, _parentID: post.id, groupArrayText: myGroup_groupArray_row1Text },
        { _order: 1, _parentID: post.id, groupArrayText: myGroup_groupArray_row2Text },
      ])
      .returning()
      .all()

    // There is a localized subfield to populate on the array fields
    // so we need to insert those as well
    db.insert(posts_my_array_locales)
      .values([
        { _parentID: arrayRows[0].id, subField: myArraySubField1, _locale: 'en' },
        { _parentID: arrayRows[1].id, subField: myArraySubField2, _locale: 'en' },
      ])
      .returning()
      .get()

    // Create block data for the myBlocks field
    const block1Rows = db
      .insert(posts_block1)
      .values(
        { _order: 1, _parentID: post.id, _locale: 'en', nonLocalizedText: 'hello', _path: 'myBlocks' },
      )
      .returning()
      .all()

    db.insert(posts_block1_locales)
      .values(
        { _parentID: block1Rows[0].id, _locale: 'en', localizedText: 'hello in english' },
      )
      .returning()
      .all()

    db.insert(posts_block2)
      .values(
        { _order: 2, _parentID: post.id, _locale: 'en', number: 123, _path: 'myBlocks' },
      )
      .returning()
      .all()
  })

  it('finds and transforms data to payload-expected shape', async () => {
    const [result] = find<Post>({
      config: payloadConfig,
      db,
      depth: 0,
      collection: postsCollection,
      locale: 'en',
    })

    // Group tests
    expect(typeof result.myGroup).toEqual('object')
    expect(result.myGroup?.subField).toEqual(myGroup_subField)
    expect(result.myGroup?.subFieldLocalized).toEqual(myGroup_subFieldLocalizedEN)
    expect(result.myGroup?.subGroup?.subSubField).toEqual(myGroup_subGroup_subSubField)
    expect(result.myGroup?.subGroup?.subSubFieldLocalized).toEqual(myGroup_subGroup_subSubFieldLocalizedEN)
    expect(result.myGroup?.groupArray[0].groupArrayText).toEqual(myGroup_groupArray_row1Text)
    expect(result.myGroup?.groupArray[1].groupArrayText).toEqual(myGroup_groupArray_row2Text)

    // Array tests
    expect(result.myArray?.[0]?.subField).toEqual(myArraySubField1)
    expect(result.myArray?.[1]?.subField).toEqual(myArraySubField2)

    expect(result.myArray?.[0]?.mySubArray[0].subSubField).toEqual(subSubFieldRow1SubRow1)
    expect(result.myArray?.[0]?.mySubArray[1].subSubField).toEqual(subSubFieldRow1SubRow2)
    expect(result.myArray?.[1]?.mySubArray[0].subSubField).toEqual(subSubFieldRow2SubRow1)
    expect(result.myArray?.[1]?.mySubArray[1].subSubField).toEqual(subSubFieldRow2SubRow2)

    // Relationship hasOne
    expect(result.relationHasOne).toEqual(1)

    // Relationship hasOnePoly
    expect(typeof result.relationHasOnePoly).toEqual('object')

    if (typeof result.relationHasOnePoly === 'object') {
      expect(result.relationHasOnePoly.relationTo).toEqual('people')
      expect(typeof result.relationHasOnePoly.value).toEqual('number')
    }

    // Relationship hasMany
    expect(result.relationHasMany[0]).toEqual(1)
    expect(result.relationHasMany[1]).toEqual(2)

    // Relationship hasManyPoly
    expect(result.relationHasManyPoly[0].relationTo).toEqual('people')
    expect(result.relationHasManyPoly[0].value).toEqual(1)
    expect(result.relationHasManyPoly[1].relationTo).toEqual('pages')
    expect(result.relationHasManyPoly[1].value).toEqual(2)
  })

  it('finds with specified locale', async () => {
    const [result] = find<Post>({
      config: payloadConfig,
      db,
      depth: 2,
      collection: postsCollection,
      locale: 'es',
    })

    expect(result.title).toStrictEqual(postTitleES)
    expect(result.myGroup.subFieldLocalized).toStrictEqual(myGroup_subFieldLocalizedES)
  })

  it('finds with specified locale and fallback locale', async () => {
    expect(true).toStrictEqual(true)
  })

  it('finds with depth: 1', async () => {
    const [result] = find<Post>({
      config: payloadConfig,
      db,
      depth: 1,
      collection: postsCollection,
      locale: 'en',
    })

    // Relationship hasOne
    expect(typeof result.relationHasOne).toEqual('object')

    if (typeof result.relationHasOne === 'object') {
      expect(result.relationHasOne.slug).toEqual(pages1Slug)
    }

    // Relationship hasOnePoly
    expect(typeof result.relationHasOnePoly).toEqual('object')

    if (typeof result.relationHasOnePoly === 'object') {
      expect(result.relationHasOnePoly.relationTo).toEqual('people')

      if (typeof result.relationHasOnePoly.value === 'object' && 'fullName' in result.relationHasOnePoly.value) {
        expect(result.relationHasOnePoly.value?.fullName).toEqual(people1FullName)
      }
    }

    // Relationship hasMany
    expect(typeof result.relationHasMany[0]).toEqual('object')

    if (typeof result.relationHasMany[0] === 'object') {
      expect(result.relationHasMany[0].slug).toEqual(pages1Slug)
    }

    expect(typeof result.relationHasMany[1]).toEqual('object')

    if (typeof result.relationHasMany[1] === 'object') {
      expect(result.relationHasMany[1].slug).toEqual(pages2Slug)
    }

    // Relationship hasManyPoly
    expect(result.relationHasManyPoly[0].relationTo).toEqual('people')
    expect(typeof result.relationHasManyPoly[0].value).toEqual('object')

    if (typeof result.relationHasManyPoly[0].value === 'object' && 'fullName' in result.relationHasManyPoly[0].value) {
      expect(result.relationHasManyPoly[0].value.fullName).toEqual(people1FullName)
    }

    expect(result.relationHasManyPoly[1].relationTo).toEqual('pages')
    expect(typeof result.relationHasManyPoly[1].value).toEqual('object')

    if (typeof result.relationHasManyPoly[1].value === 'object' && 'slug' in result.relationHasManyPoly[1].value) {
      expect(result.relationHasManyPoly[1].value.slug).toEqual(pages2Slug)
    }
  })

  it('finds with depth: 2', async () => {
    const [result] = find<Post>({
      config: payloadConfig,
      db,
      depth: 2,
      collection: postsCollection,
      locale: 'en',
    })

    expect(typeof result.selfReferencingRelationship).toEqual('object')

    if (typeof result.selfReferencingRelationship === 'object') {
      expect(typeof result.selfReferencingRelationship).toEqual('object')

      expect(typeof result.selfReferencingRelationship.selfReferencingRelationship).toEqual('object')

      if (typeof result.selfReferencingRelationship.selfReferencingRelationship === 'object') {
        expect(typeof result.selfReferencingRelationship.selfReferencingRelationship).toEqual('object')
        expect(typeof result.selfReferencingRelationship.selfReferencingRelationship.selfReferencingRelationship).toEqual('number')
      }
    }

  })
})

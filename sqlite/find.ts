import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { SanitizedCollectionConfig } from 'payload/types'
import { buildWithFromDepth } from './utilities/buildWithFromDepth'
import { createLocaleWhereQuery } from './utilities/createLocaleWhereQuery'

type FindArgs = {
  collection: SanitizedCollectionConfig
  collectionSlugs: string[]
  db: BetterSQLite3Database<typeof schema>
  depth: number
  fallbackLocale?: string | false
  locale?: string
}

// We can make one query to get docs with locales and array / block fields
export const find = ({
  collection,
  collectionSlugs,
  db,
  depth,
  fallbackLocale,
  locale,
}: FindArgs) => {
  const findManyArgs = {
    with: {
      _relationships: {
        orderBy: ({ order }, { asc }) => [asc(order)],
        columns: {
          id: false,
          parent: false,
        },
        with: buildWithFromDepth({ collectionSlugs, depth })
      },
      _locales: {
        where: createLocaleWhereQuery({ fallbackLocale, locale }),
        columns: {
          id: false,
          _parentID: false,
        },
      },
      myArray: {
        orderBy: ({ _order }, { asc }) => [asc(_order)],
        columns: {
          _parentID: false,
          _order: false,
        },
        with: {
          _locales: {
            where: createLocaleWhereQuery({ fallbackLocale, locale }),
            columns: {
              id: false,
              _parentID: false,
            },
          },
        },
      },
      _blocks_block1: {
        columns: {
          _parentID: false,
        },
        with: {
          _locales: {
            where: createLocaleWhereQuery({ fallbackLocale, locale }),
            columns: {
              id: false,
              _parentID: false,
            },
          },
        },
      },
      _blocks_block2: {
        columns: {
          _parentID: false,
        },
      },
    }
  }

  const result = db.query[collection.slug].findMany(findManyArgs)

  // const result = db.query.posts.findMany({
  //   with: {
  //     _relationships: {
  //       orderBy: ({ order }, { asc }) => [asc(order)],
  //       columns: {
  //         id: false,
  //         parent: false,
  //       },
  //       with: {
  //         pagesID: true,
  //         peopleID: true,
  //       }
  //     },
  //     _locales: {
  //       where: ({ _locale }, { eq }) => eq(_locale, 'en'),
  //       columns: {
  //         id: false,
  //         _parentID: false,
  //         _locale: false,
  //       },
  //     },
  //     myArray: {
  //       orderBy: ({ _order }, { asc }) => [asc(_order)],
  //       columns: {
  //         _parentID: false,
  //         _order: false,
  //         _locale: false,
  //       },
  //       with: {
  //         _locales: {
  //           where: ({ _locale }, { eq }) => eq(_locale, 'en'),
  //           columns: {
  //             id: false,
  //             _parentID: false,
  //             _locale: false,
  //           },
  //         },
  //       },
  //     },
  //   },
  // })

  return result
}
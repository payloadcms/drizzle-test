import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { SanitizedCollectionConfig } from 'payload/types'
import { buildFindManyArgs } from './buildFindQuery'
import { SanitizedConfig } from 'payload/config'

type FindArgs = {
  config: SanitizedConfig
  collection: SanitizedCollectionConfig
  db: BetterSQLite3Database<typeof schema>
  depth: number
  fallbackLocale?: string | false
  locale?: string
}

// We can make one query to get docs with locales and array / block fields
export const find = ({
  config,
  collection,
  db,
  depth,
  fallbackLocale,
  locale,
}: FindArgs) => {
  const findManyArgs = buildFindManyArgs({
    config,
    collection,
    depth,
    fallbackLocale,
    locale,
  })

  const result = db.query[collection.slug].findMany(findManyArgs)

  return result
}
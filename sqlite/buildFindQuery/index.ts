import { ArrayField, Block } from 'payload/types'
import { SanitizedCollectionConfig } from 'payload/dist/collections/config/types'
import { traverseFields } from './traverseFields'
import { SanitizedConfig } from 'payload/config'

type BuildFindQueryArgs = {
  config: SanitizedConfig
  collection: SanitizedCollectionConfig
  collectionSlugs: string[]
  depth: number
  fallbackLocale?: string | false
  locale?: string
}

// Generate the Drizzle query for findMany based on
// a collection field structure
export const buildFindManyArgs = ({
  config,
  collection,
  collectionSlugs,
  depth,
  fallbackLocale,
  locale,
}: BuildFindQueryArgs): Record<string, unknown> => {
  const findManyArgs = {
    with: {
      _relationships: undefined,
      _locales: undefined,
    },
  }

  const locatedBlocks: Block[] = []
  const locatedArrays: { [path: string]: ArrayField } = {}

  traverseFields({
    collectionSlugs,
    config,
    depth,
    fallbackLocale,
    fields: collection.fields,
    findManyArgs,
    locale,
    locatedArrays,
    locatedBlocks,
    path: '',
  })

  return findManyArgs
}
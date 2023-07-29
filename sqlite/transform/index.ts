import { Field } from 'payload/types'
import { traverseFields } from './traverseFields'
import { createRelationshipMap } from '../utilities/createRelationshipMap'
import { mergeLocales } from './mergeLocales'
import { TypeWithID } from 'payload/dist/collections/config/types'
import { createBlocksMap } from '../utilities/createBlocksMap'
import { SanitizedConfig } from 'payload/config'

type TransformArgs = {
  config: SanitizedConfig
  data: Record<string, unknown>
  fallbackLocale?: string | false
  fields: Field[]
  locale?: string
}

// This is the entry point to transform Drizzle output data
// into the shape Payload expects based on field schema
export const transform = <T extends TypeWithID>({
  config,
  data,
  fallbackLocale,
  fields,
  locale,
}: TransformArgs): T => {
  let relationships: Record<string, Record<string, unknown>[]> = {};

  if ('_relationships' in data) {
    relationships = createRelationshipMap(data._relationships)
    delete data._relationships
  }

  const blocks = createBlocksMap(data)

  const dataWithLocales = mergeLocales({ data, locale, fallbackLocale })

  return traverseFields<T>({
    blocks,
    config,
    data,
    fields,
    locale,
    path: '',
    relationships,
    siblingData: dataWithLocales,
    table: dataWithLocales,
  })

}
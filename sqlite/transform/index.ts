import { Field } from 'payload/types'
import { traverseFields } from './traverseFields'
import { createRelationshipMap } from './createRelationshipMap'
import { mergeLocales } from './mergeLocales'
import { TypeWithID } from 'payload/dist/collections/config/types'

type TransformArgs = {
  data: Record<string, unknown>[]
  fields: Field[]
  locale?: string
}

// This is the entry point to transform Drizzle output data
// into the shape Payload expects based on field schema
export const transform = <T extends TypeWithID>({
  data,
  fields,
  locale,
}: TransformArgs): T[] => {
  return data.map((row) => {
    let relationships: Record<string, Record<string, unknown>[]> = {};

    if ('_relationships' in row) {
      relationships = createRelationshipMap(row._relationships)
      delete row._relationships
    }

    const dataWithLocales = mergeLocales({ data: row, locale })

    return traverseFields<T>({
      data: row,
      fields,
      locale,
      path: '',
      relationships,
      siblingData: dataWithLocales,
      table: dataWithLocales,
    })
  })
}
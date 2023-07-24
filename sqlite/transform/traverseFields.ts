import { fieldAffectsData } from 'payload/dist/fields/config/types'
import { Field } from 'payload/types'
import { mergeLocales } from './mergeLocales'
import { BlocksMap } from '../utilities/createBlocksMap'

type TraverseFieldsArgs = {
  /**
   * Pre-formatted blocks map
   */
  blocks: BlocksMap
  /**
   * The full data, as returned from the Drizzle query
   */
  data: Record<string, unknown>
  /**
   * The locale to fall back to, if no locale present
   */
  fallbackLocale?: string
  /**
   * An array of Payload fields to traverse
   */
  fields: Field[]
  /**
   * The locale to retrieve
   */
  locale?: string
  /**
   * The current field path (in dot notation), used to merge in relationships
   */
  path: string
  /**
   * All related documents, as returned by Drizzle, keyed on an object by field path
   */
  relationships: Record<string, Record<string, unknown>[]>
  /**
   * Sibling data of the fields to traverse
   */
  siblingData: Record<string, unknown>
  /**
   * Data structure representing the nearest table from db
   */
  table: Record<string, unknown>
}

// Traverse fields recursively, transforming data 
// for each field type into required Payload shape
export const traverseFields = <T extends Record<string, unknown>>({
  blocks,
  data,
  fallbackLocale,
  fields,
  locale,
  path,
  relationships,
  siblingData,
  table,
}: TraverseFieldsArgs): T => {
  const sanitizedPath = path ? `${path}.` : path

  const formatted = fields.reduce((result, field) => {
    if (fieldAffectsData(field)) {
      const fieldData = result[field.name]

      switch (field.type) {
        case 'array':
          if (Array.isArray(fieldData)) {
            result[field.name] = fieldData.map((row, i) => {
              const dataWithLocales = mergeLocales({ data: row, locale, fallbackLocale })

              return traverseFields<T>({
                blocks,
                data,
                fields: field.fields,
                locale,
                path: `${sanitizedPath}${field.name}.${i}`,
                relationships,
                siblingData: dataWithLocales,
                table: dataWithLocales,
              })
            })
          }

          break;

        case 'blocks':
          const blockFieldPath = `${sanitizedPath}${field.name}`

          if (Array.isArray(blocks[blockFieldPath])) {
            result[field.name] = blocks[blockFieldPath].map((row, i) => {
              delete row._order
              const dataWithLocales = mergeLocales({ data: row, locale, fallbackLocale })
              const block = field.blocks.find(({ slug }) => slug === row.blockType)

              if (block) {
                return traverseFields<T>({
                  blocks,
                  data,
                  fields: block.fields,
                  locale,
                  path: `${blockFieldPath}.${i}`,
                  relationships,
                  siblingData: dataWithLocales,
                  table: dataWithLocales,
                })
              }

              return {}

            })
          }

          break;

        case 'group':
          const groupData: Record<string, unknown> = {
            ...(typeof fieldData === 'object' ? fieldData : {})
          }

          field.fields.forEach((subField) => {
            if (fieldAffectsData(subField)) {
              const subFieldKey = `${sanitizedPath.replace(/[.]/g, '_')}${field.name}_${subField.name}`
              if (table[subFieldKey]) {
                groupData[subField.name] = table[subFieldKey]
                delete table[subFieldKey]
              }
            }
          })

          result[field.name] = traverseFields<Record<string, unknown>>({
            blocks,
            data,
            fields: field.fields,
            locale,
            path: `${sanitizedPath}${field.name}`,
            relationships,
            siblingData: groupData,
            table,
          })

          break;

        case 'relationship':
          const relationPathMatch = relationships[`${sanitizedPath}${field.name}`]

          if (!field.hasMany) {
            const relation = relationPathMatch[0]

            if (relation) {
              // Handle hasOne Poly
              if (Array.isArray(field.relationTo)) {
                const matchedRelation = Object.entries(relation).find(([, val]) => typeof val === 'object' && val !== null)

                if (matchedRelation) {
                  result[field.name] = {
                    relationTo: matchedRelation[0].replace('ID', ''),
                    value: matchedRelation[1]
                  }
                }
              } else {
                // Handle hasOne
                result[field.name] = relation[`${field.relationTo}ID`]
              }
            }
          } else {
            const relationships = [
              ...(Array.isArray(fieldData) ? fieldData : []),
            ]

            relationPathMatch.forEach((relation) => {
              // Handle hasMany
              if (Array.isArray(field.relationTo)) {
                const matchedRelation = Object.entries(relation).find(([, val]) => typeof val === 'object' && val !== null)

                if (matchedRelation) {
                  relationships.push({
                    relationTo: matchedRelation[0].replace('ID', ''),
                    value: matchedRelation[1]
                  })
                }
              } else {
                // Handle hasMany Poly
                relationships.push(relation[`${field.relationTo}ID`])
              }
            })

            result[field.name] = relationships
          }

        default:
          break;
      }

      return result;
    }

    return siblingData
  }, siblingData)

  return formatted as T
}
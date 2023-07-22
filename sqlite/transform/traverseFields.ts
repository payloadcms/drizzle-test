import { fieldAffectsData } from 'payload/dist/fields/config/types'
import { Field } from 'payload/types'
import { mergeLocales } from './mergeLocales'

type TraverseFieldsArgs = {
  /**
   * The full data, as returned from the Drizzle query
   */
  data: Record<string, unknown>
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
   * Data corresponding to the fields to traverse 
   */
  table: Record<string, unknown>
}

// Traverse fields recursively, transforming data 
// for each field type into required Payload shape
export const traverseFields = <T extends Record<string, unknown>>({
  data,
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
              const dataWithLocales = mergeLocales({ data: row, locale })

              return traverseFields<T>({
                data: data,
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
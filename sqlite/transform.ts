import { fieldAffectsData } from 'payload/dist/fields/config/types'
import { Field } from 'payload/types'

type IterateFieldsArgs = {
  doc: Record<string, unknown>
  fields: Field[]
  locale?: string
  path: string
  relationships: Record<string, Record<string, unknown>[]>
  siblingDoc: Record<string, unknown>
}

const iterateFields = ({
  doc,
  fields,
  locale,
  path,
  relationships,
  siblingDoc,
}: IterateFieldsArgs) => {
  let docResult = mergeLocales({ doc: siblingDoc, locale })
  const sanitizedPath = path ? `${path}.` : path

  return fields.reduce((result, field) => {
    if (fieldAffectsData(field)) {
      let fieldData = result[field.name]

      switch (field.type) {
        case 'array':
          if (Array.isArray(fieldData)) {
            result[field.name] = fieldData.map((row, i) => {
              return iterateFields({
                fields: field.fields,
                doc,
                siblingDoc: row,
                locale,
                path: `${sanitizedPath}${field.name}.${i}.`,
                relationships,
              })
            })
          }

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
            result[field.name] = []
            relationPathMatch.forEach((relation) => {
              // Handle hasMany
              if (Array.isArray(field.relationTo)) {
                const matchedRelation = Object.entries(relation).find(([, val]) => typeof val === 'object' && val !== null)

                if (matchedRelation) {
                  result[field.name].push({
                    relationTo: matchedRelation[0].replace('ID', ''),
                    value: matchedRelation[1]
                  })
                }
              } else {
                // Handle hasMany Poly
                result[field.name].push(relation[`${field.relationTo}ID`])
              }

            })
          }

        default:
          break;
      }

      return result;
    }
  }, docResult)
}

type MergeLocalesArgs = {
  doc: Record<string, unknown>
  locale?: string
}

export const mergeLocales = ({
  doc,
  locale
}: MergeLocalesArgs) => {
  if (Array.isArray(doc._locales)) {
    if (locale && doc._locales.length === 1) {

      const merged = {
        ...doc,
        ...doc._locales[0]
      }

      delete merged._locales

      return merged
    }

    const fieldLocales = doc._locales.reduce((res, row) => {
      const locale = row.locale
      delete row.locale;

      if (locale) {
        Object.entries(row).forEach(([field, val]) => {
          if (!res[field]) res[field] = {}
          res[field][locale] = val
        })
      }

      return res
    }, {})

    delete doc._locales

    return {
      ...doc,
      ...fieldLocales,
    }
  }
}

type TransformArgs = {
  data: Record<string, unknown>[]
  fields: Field[]
  locale?: string
}

export const transform = ({
  data,
  fields,
  locale,
}: TransformArgs) => {
  return data.map((doc) => {
    let relationships = {}

    // Flatten relationships to object with path keys
    // for easier retrieval
    if (Array.isArray(doc._relationships)) {
      relationships = doc._relationships.reduce((res, relation) => {
        const formattedRelation = {
          ...relation
        }

        delete formattedRelation.path

        if (!res[relation.path]) res[relation.path] = []
        res[relation.path].push(formattedRelation)

        return res
      }, {})

      delete doc._relationships
    }

    return iterateFields({ fields, doc, siblingDoc: doc, locale, path: '', relationships })
  })
}
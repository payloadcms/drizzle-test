import { SanitizedConfig } from "payload/config"
import { fieldAffectsData } from "payload/dist/fields/config/types"
import { ArrayField, Block, Field } from "payload/types"

type TraverseFieldArgs = {
  collectionSlugs: string[],
  config: SanitizedConfig,
  depth?: number,
  fallbackLocale?: string | false,
  fields: Field[]
  findManyArgs: Record<string, unknown>,
  locale?: string,
  locatedArrays: { [path: string]: ArrayField },
  locatedBlocks: Block[],
  path: string,
}

export const traverseFields = ({
  collectionSlugs,
  config,
  depth,
  fallbackLocale,
  fields,
  findManyArgs,
  locale,
  locatedArrays,
  locatedBlocks,
  path,
}: TraverseFieldArgs) => {
  fields.forEach((field) => {
    if (fieldAffectsData(field)) {
      switch (field.type) {
        case 'array': {

        }

        case 'blocks': {

        }

        case 'relationship': {

        }
      }
    }
  })

  return findManyArgs
}
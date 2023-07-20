import { Config } from 'payload/config'
import { CollectionConfig } from 'payload/types'

export const Posts: CollectionConfig = {
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
    },
    {
      name: 'number',
      type: 'number',
      localized: true,
    },
    {
      name: 'myArray',
      type: 'array',
      fields: [
        {
          name: 'subField',
          type: 'text',
          localized: true,
        }
      ]
    },
    // Has One
    {
      name: 'relationHasOne',
      type: 'relationship',
      relationTo: 'pages',
    },
    // Has Many
    {
      name: 'relationHasMany',
      type: 'relationship',
      hasMany: true,
      relationTo: 'pages'
    },
    // Has One - Polymorphic
    {
      name: 'relationHasOnePoly',
      type: 'relationship',
      relationTo: ['people', 'pages']
    },
    // Has Many - Polymorphic
    {
      name: 'relationHasManyPoly',
      type: 'relationship',
      hasMany: true,
      relationTo: ['people', 'pages']
    },
  ]
}

// This is the reference Payload config that we will build
// It's not really USED in this project - it's just a demo
export const config: Config = {
  collections: [
    Posts,
    {
      slug: 'pages',
      fields: [
        {
          name: 'slug',
          type: 'text',
        }
      ]
    },
    {
      slug: 'people',
      fields: [
        {
          name: 'fullName',
          type: 'text',
          localized: true,
        },
      ]
    },
  ]
}
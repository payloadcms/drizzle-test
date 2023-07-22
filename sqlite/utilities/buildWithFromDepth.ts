type BuildWithFromDepthArgs = {
  collectionSlugs: string[]
  depth: number
}

export const buildWithFromDepth = ({
  collectionSlugs,
  depth
}: BuildWithFromDepthArgs): Record<string, unknown> | undefined => {
  if (depth <= 0) return undefined

  const result = collectionSlugs.reduce((slugs, slug) => {
    if (depth === 1) {
      slugs[`${slug}ID`] = true
    } else {
      slugs[`${slug}ID`] = buildWithFromDepth({ collectionSlugs, depth: depth - 1 })
    }

    return slugs
  }, {})

  return result
}
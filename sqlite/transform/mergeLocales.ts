type MergeLocalesArgs = {
  data: Record<string, unknown>
  locale?: string
}

// Merge _locales into the parent data
// based on which locale(s) are asked for
export const mergeLocales = ({
  data,
  locale
}: MergeLocalesArgs): Record<string, unknown> => {
  if (Array.isArray(data._locales)) {
    if (locale && data._locales.length === 1) {

      const merged = {
        ...data,
        ...data._locales[0]
      }

      delete merged._locales

      return merged
    }

    const fieldLocales = data._locales.reduce((res, row) => {
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

    delete data._locales

    return {
      ...data,
      ...fieldLocales,
    }
  }

  return data
}
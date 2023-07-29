type MergeLocalesArgs = {
  data: Record<string, unknown>
  fallbackLocale?: string | false
  locale?: string
}

// Merge _locales into the parent data
// based on which locale(s) are asked for
export const mergeLocales = ({
  data,
  fallbackLocale,
  locale
}: MergeLocalesArgs): Record<string, unknown> => {
  if (Array.isArray(data._locales)) {
    if (locale) {
      const matchedLocale = data._locales.find((row) => row._locale === locale)

      if (matchedLocale) {
        const merged = {
          ...data,
          ...matchedLocale
        }

        delete merged._locales
        delete merged._locale
        return merged
      } else if (fallbackLocale) {
        const matchedFallbackLocale = data._locales.find((row) => row._locale === fallbackLocale)

        if (matchedFallbackLocale) {
          const merged = {
            ...data,
            ...matchedFallbackLocale,
          }
          delete merged._locales
          delete merged._locale
          return merged
        }
      }
    }

    const fieldLocales = data._locales.reduce((res, row) => {
      const locale = row._locale
      delete row._locale;

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
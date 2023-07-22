type createLocaleWhereQuery = {
  fallbackLocale?: string | false
  locale?: string
}

export const createLocaleWhereQuery = ({ fallbackLocale, locale }) => {
  if (!locale) return undefined
  if (fallbackLocale) return ({ _locale }, { or, eq }) => or(eq(_locale, locale), eq(_locale, fallbackLocale))
}
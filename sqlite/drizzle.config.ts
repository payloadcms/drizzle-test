import { Config } from 'drizzle-kit'

export default {
  out: 'migrations',
  schema: 'schema.ts',
  breakpoints: false,
  driver: 'better-sqlite',
  dbCredentials: {
    url: 'db.sqlite',
  },
} satisfies Config

import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import { users } from './schema'

const sqlite = new Database('sqlite.db')
const db: BetterSQLite3Database = drizzle(sqlite)

migrate(db, { migrationsFolder: './migrations' })

console.log('inserting')
const res1 = db.insert(users).values({ fullName: 'John Doe', age: 42 }).returning()

const res2 = db.insert(users).values({ fullName: 'John Doe 2', age: 43 }).returning()

console.log('done')
console.log({ res1: res1.get(), res2: res2.get() })

const result = db.select().from(users).all()
console.log({ result })

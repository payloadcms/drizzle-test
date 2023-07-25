# Payload + Drizzle Data Structure PoC

This repository showcases the work that the Payload team is performing in regards to how to map the Payload field schema to a relational database structure. It's built on top of Drizzle ORM.

The goals for this repository are as follows:

1. Demonstrate how to map Payload fields and features over to a relational database structure
1. Insert data of the correct shape into a database
1. Retrieve the data that Payload APIs require in a performant fashion
1. Transform the raw response from the database into the shape that Payload expects

### SQLite

We've started with the "lowest common denominator" being SQLite, but once we have alignment on how to proceed, we will move on to Postgres.

[Here is the code for our SQLite proof of concept](https://github.com/payloadcms/drizzle-test/tree/master/sqlite).
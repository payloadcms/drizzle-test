# Payload + Drizzle Data Structure PoC - SQLite

The ability for Payload to support SQLite databases will have a ton of very positive ramifications for Payload developers.

Firstly, it will allow for a much more effective "onboarding" experience for new developers coming into the community. New developers will not have to ensure they have access to a running database, and will instead be able to run a single command, with no external services, to begin work.

In addition, by identifying how to map our data to the "lowest common denominator" of relational databases, we can "opt in" to other available database features as we continue to add support.

The code in this repository is written entirely via a simple Jest test suite, at `./sqlite/int.spec.ts`.

### Getting Started

1. Clone this repo
1. Run `yarn` in the `/sqlite` folder
1. Run `yarn test` to see the successfully passing tests

#### Debugging

This repository comes with a VSCode debugging script, which can be leveraged to debug tests as they are executed.

#### Database migration

Every time the tests are run, the SQLite database, stored at `./sqlite/db.sqlite` will be deleted and recreated. We also run Drizzle migrations directly each time before tests begin.

# integrations

The church's code fitted to a framework: what `apps/*` build on, shaped for
the framework they are built with. A package in [`packages/`](../packages)
is the church's own and runs anywhere — the schema, the database, the
theme. A package here wires those into one framework's way of doing
things, so every app on that framework starts from the same place.

| package             | what it is                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| [`@bbf/nuxt`](nuxt) | the Nuxt layer both apps extend, over [`@zoobzio/nuxt`](https://github.com/zoobzio/foundation) |

An app reaches one by extending it, not by copying what it holds. What
belongs here is what every app on the framework would otherwise repeat; what
only one app needs stays in that app.

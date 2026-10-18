import type { Contract } from "@bbf/database";
import type { Arguments, Row } from "bezoar";

// Rows: what a query of `@bbf/database` returns, named by its columns. A
// transform under `dto/` takes one and builds the model `@bbf/schema` says
// the API answers with.

/** Every column an event's row can carry, as `web.events.bySlug` reads them. */
type EventColumns = Row<Contract, "web.events.bySlug">;

/**
 * An event as a query returns it. `web.events.weekly` leaves out `date` and
 * `web.events.upcoming` leaves out `day` and `weeks`, each knowing its kind
 * of event has none, so a row may do without those three; the admin's rows
 * carry more, and pass as they are.
 */
export type EventRow = Omit<EventColumns, "date" | "day" | "weeks"> &
  Partial<Pick<EventColumns, "date" | "day" | "weeks">>;

/** A staff member as a query returns them: the columns the contact page lists. */
export type StaffRow = Row<Contract, "web.staff.list">;

/** A sermon as a query returns it: its `published_at` is a `Date`. */
export type SermonRow = Row<Contract, "web.sermons.byId">;

// Arguments: what a query of `@bbf/database` takes, named by its slots. A
// transform under `dao/` builds one from an input of `@bbf/schema`.

/**
 * What writing an event takes. `admin.events.create` takes exactly this,
 * and `admin.events.update` this and the `id` of the row it replaces.
 */
export type EventArguments = Arguments<Contract, "admin.events.create">;

/**
 * What writing a staff member takes. `admin.staff.create` takes exactly
 * this, and `admin.staff.update` this and the `id` of the row it replaces.
 */
export type StaffArguments = Arguments<Contract, "admin.staff.create">;

/** What `admin.sermons.upsert` takes: a sermon as the feed lists it. */
export type SermonArguments = Arguments<Contract, "admin.sermons.upsert">;

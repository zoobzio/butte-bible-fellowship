import type { Contract } from "@bbf/database";
import type { Arguments, Row } from "bezoar";

// Rows: what a query of `@bbf/database` returns, named by its columns. A
// transform under `dto/` takes one and builds the model `@bbf/schema` says
// the API answers with.

/** Every column an event's row can carry, as `web.events.fetch` reads them. */
type EventColumns = Row<Contract, "web.events.fetch">;

/** The columns a query of the events may leave out. */
type EventSpare = "date" | "day" | "weeks" | "body";

/**
 * An event as a query returns it. `web.events.weekly` leaves out `date` and
 * `web.events.upcoming` leaves out `day` and `weeks`, each knowing its kind
 * of event has none; every list leaves out `body`, which is the event's own
 * page's to carry. So a row may do without those four; the admin's rows
 * carry more, and pass as they are.
 */
export type EventRow = Omit<EventColumns, EventSpare> &
  Partial<Pick<EventColumns, EventSpare>>;

/**
 * An event as the admin's queries return it: every column of the row,
 * `admin.events.list` and `admin.events.fetch` alike. What `toEventRecord`
 * takes.
 */
export type EventRecordRow = Row<Contract, "admin.events.fetch">;

/**
 * A staff member as a query returns them: the columns the site lists. The
 * admin's rows carry more, and pass as they are.
 */
export type StaffRow = Row<Contract, "web.staff.list">;

/**
 * A staff member as the admin's queries return them: every column of the
 * row, `admin.staff.list` and `admin.staff.fetch` alike. What
 * `toStaffRecord` takes.
 */
export type StaffRecordRow = Row<Contract, "admin.staff.fetch">;

/** Every column a sermon's row can carry, as `web.sermons.fetch` reads them. */
type SermonColumns = Row<Contract, "web.sermons.fetch">;

/**
 * A sermon as a query returns it. `web.sermons.list` leaves out `body`,
 * which is the sermon's own page's to carry, so a row may do without it;
 * the admin's rows carry more, and pass as they are.
 */
export type SermonRow = Omit<SermonColumns, "body"> &
  Partial<Pick<SermonColumns, "body">>;

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

/**
 * What writing a sermon takes. `admin.sermons.create` takes exactly this,
 * and `admin.sermons.update` this and the `id` of the row it replaces.
 */
export type SermonArguments = Arguments<Contract, "admin.sermons.create">;

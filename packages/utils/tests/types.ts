import type { Contract } from "@bbf/database";
import type { Arguments, Row } from "bezoar";

import type {
  toEventArguments,
  toSermonArguments,
  toStaffArguments,
} from "../src/dao";
import {
  toChurchEvent,
  toEventRecord,
  toSermon,
  toStaffMember,
  toStaffRecord,
} from "../src/dto";

/**
 * What the transforms promise at the type level. `pnpm typecheck` proves
 * each against `@bbf/database`'s build and `@bbf/schema`'s types: a column
 * renamed or a field added on either side fails here, before any app.
 */
declare const listed: Row<Contract, "web.events.list">;
declare const weekly: Row<Contract, "web.events.weekly">;
declare const upcoming: Row<Contract, "web.events.upcoming">;
declare const fetched: Row<Contract, "web.events.fetch">;
declare const adminEvent: Row<Contract, "admin.events.fetch">;
declare const adminEvents: Row<Contract, "admin.events.list">;
declare const webStaff: Row<Contract, "web.staff.list">;
declare const webOne: Row<Contract, "web.staff.fetch">;
declare const adminStaff: Row<Contract, "admin.staff.fetch">;
declare const adminStaffList: Row<Contract, "admin.staff.list">;
declare const listedSermon: Row<Contract, "web.sermons.list">;
declare const fetchedSermon: Row<Contract, "web.sermons.fetch">;
declare const adminSermon: Row<Contract, "admin.sermons.fetch">;

// Every query of a kind returns a row its transform takes.
export const events = [listed, weekly, upcoming, fetched, adminEvent].map(
  toChurchEvent,
);
export const staff = [webStaff, webOne, adminStaff].map(toStaffMember);
export const sermons = [listedSermon, fetchedSermon, adminSermon].map(toSermon);

// The admin's queries, listed or fetched, return a row a record is built from.
export const eventRecords = [adminEvent, adminEvents].map(toEventRecord);
export const staffRecords = [adminStaff, adminStaffList].map(toStaffRecord);

// @ts-expect-error The site's row has no id, status or timestamps: it is no record.
export const noRecord = toStaffRecord(webStaff);

// @ts-expect-error A list's row of the site has no id either.
export const noEventRecord = toEventRecord(listed);

// @ts-expect-error A row without a start is no event.
export const noStart = toChurchEvent({ slug: "x", title: "x" });

// @ts-expect-error A row without a date is no sermon.
export const noDate = toSermon({ slug: "x", title: "x" });

// What a create takes, an update takes with the id of the row it replaces.
declare const eventArguments: ReturnType<typeof toEventArguments>;
declare const staffArguments: ReturnType<typeof toStaffArguments>;
declare const sermonArguments: ReturnType<typeof toSermonArguments>;
export const createEvent: Arguments<Contract, "admin.events.create"> =
  eventArguments;
export const updateEvent: Arguments<Contract, "admin.events.update"> = {
  ...eventArguments,
  id: 1,
};
export const createStaff: Arguments<Contract, "admin.staff.create"> =
  staffArguments;
export const updateStaff: Arguments<Contract, "admin.staff.update"> = {
  ...staffArguments,
  id: 1,
};
export const createSermon: Arguments<Contract, "admin.sermons.create"> =
  sermonArguments;
export const updateSermon: Arguments<Contract, "admin.sermons.update"> = {
  ...sermonArguments,
  id: 1,
};

// @ts-expect-error An update needs the id of the row it replaces.
export const updateNothing: Arguments<Contract, "admin.events.update"> =
  eventArguments;

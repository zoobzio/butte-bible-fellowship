import type { Contract } from "@bbf/database";
import type { StaffBody, StaffRecord } from "@bbf/schema/types";
import type { Arguments, Row } from "bezoar";

import type {
  toContentArguments,
  toEventArguments,
  toSermonArguments,
  toStaffArguments,
} from "../src/dao";
import {
  toChurchEvent,
  toContentDocument,
  toContentRecord,
  toEventRecord,
  toSermon,
  toStaffMember,
  toStaffRecord,
} from "../src/dto";
import { toStaffBody, toStaffForm } from "../src/vm";

declare const listed: Row<Contract, "web.events.list">;
declare const weekly: Row<Contract, "web.events.weekly">;
declare const upcoming: Row<Contract, "web.events.upcoming">;
declare const fetched: Row<Contract, "web.events.fetch">;
declare const adminEvent: Row<Contract, "admin.events.fetch">;
declare const adminEvents: Row<Contract, "admin.events.list">;
declare const webContent: Row<Contract, "web.content.fetch">;
declare const adminContent: Row<Contract, "admin.content.fetch">;
declare const adminContentList: Row<Contract, "admin.content.list">;
declare const webStaff: Row<Contract, "web.staff.list">;
declare const adminStaff: Row<Contract, "admin.staff.fetch">;
declare const adminStaffList: Row<Contract, "admin.staff.list">;
declare const listedSermon: Row<Contract, "web.sermons.list">;
declare const fetchedSermon: Row<Contract, "web.sermons.fetch">;
declare const adminSermon: Row<Contract, "admin.sermons.fetch">;

export const events = [listed, weekly, upcoming, fetched, adminEvent].map(
  toChurchEvent,
);
export const staff = [webStaff, adminStaff].map(toStaffMember);
export const sermons = [listedSermon, fetchedSermon, adminSermon].map(toSermon);

export const contentDocuments = [webContent, adminContent].map(
  toContentDocument,
);
export const contentRecords = [adminContent, adminContentList].map(
  toContentRecord,
);
export const eventRecords = [adminEvent, adminEvents].map(toEventRecord);
export const staffRecords = [adminStaff, adminStaffList].map(toStaffRecord);

// @ts-expect-error Site row is not a record.
export const noRecord = toStaffRecord(webStaff);

// @ts-expect-error Site row has no id.
export const noContentRecord = toContentRecord(webContent);

// @ts-expect-error Site list row has no id.
export const noEventRecord = toEventRecord(listed);

// @ts-expect-error Start is required.
export const noStart = toChurchEvent({ slug: "x", title: "x" });

// @ts-expect-error Date is required.
export const noDate = toSermon({ slug: "x", title: "x" });

declare const contentArguments: ReturnType<typeof toContentArguments>;
export const createContent: Arguments<Contract, "admin.content.create"> =
  contentArguments;
export const updateContent: Arguments<Contract, "admin.content.update"> = {
  ...contentArguments,
  id: 1,
};

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

// @ts-expect-error Update needs an id.
export const updateNothing: Arguments<Contract, "admin.events.update"> =
  eventArguments;

declare const staffRecord: StaffRecord;
export const staffForm = toStaffForm(staffRecord);
export const staffBody: StaffBody = toStaffBody(staffForm);

// @ts-expect-error A form carries no bio: it is written on its own.
export const noTree = toStaffBody({ ...staffForm, bio: staffRecord.bio });

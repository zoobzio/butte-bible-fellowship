import type { Contract } from "@bbf/database";
import type { Arguments, Row } from "bezoar";

export type ContentRow = Row<Contract, "web.content.fetch">;

export type ContentRecordRow = Row<Contract, "admin.content.fetch">;

type EventColumns = Row<Contract, "web.events.fetch">;

export type EventRow = Omit<EventColumns, "body"> &
  Partial<Pick<EventColumns, "body">>;

export type EventRecordRow = Row<Contract, "admin.events.fetch">;

export type StaffRow = Row<Contract, "web.staff.list">;

export type StaffRecordRow = Row<Contract, "admin.staff.fetch">;

type SermonColumns = Row<Contract, "web.sermons.fetch">;

export type SermonRow = Omit<SermonColumns, "body"> &
  Partial<Pick<SermonColumns, "body">>;

export type ContentArguments = Arguments<Contract, "admin.content.create">;

export type EventArguments = Arguments<Contract, "admin.events.create">;

export type StaffArguments = Arguments<Contract, "admin.staff.create">;

export type SermonArguments = Arguments<Contract, "admin.sermons.create">;

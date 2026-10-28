import type { Contract } from "@bbf/database";
import type { Arguments, Row } from "bezoar";

type EventColumns = Row<Contract, "web.events.fetch">;

type EventSpare = "date" | "day" | "weeks" | "body";

export type EventRow = Omit<EventColumns, EventSpare> &
  Partial<Pick<EventColumns, EventSpare>>;

export type EventRecordRow = Row<Contract, "admin.events.fetch">;

export type StaffRow = Row<Contract, "web.staff.list">;

export type StaffRecordRow = Row<Contract, "admin.staff.fetch">;

type SermonColumns = Row<Contract, "web.sermons.fetch">;

export type SermonRow = Omit<SermonColumns, "body"> &
  Partial<Pick<SermonColumns, "body">>;

export type EventArguments = Arguments<Contract, "admin.events.create">;

export type StaffArguments = Arguments<Contract, "admin.staff.create">;

export type SermonArguments = Arguments<Contract, "admin.sermons.create">;

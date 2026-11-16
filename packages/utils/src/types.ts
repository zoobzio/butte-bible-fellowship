import type { Contract } from "@bbf/database";
import type { Arguments, Row } from "bezoar";

export type ContentRow = Row<Contract, "web.content.fetch">;

export type ContentRecordRow = Row<Contract, "admin.content.fetch">;

export type HomeRow = Row<Contract, "web.home.fetch">;

export type HomeRecordRow = Row<Contract, "admin.home.fetch">;

export type AboutRow = Row<Contract, "web.about.fetch">;

export type AboutRecordRow = Row<Contract, "admin.about.fetch">;

export type ConnectRow = Row<Contract, "web.connect.fetch">;

export type ConnectRecordRow = Row<Contract, "admin.connect.fetch">;

type EventColumns = Row<Contract, "web.events.fetch">;

export type EventRow = Omit<EventColumns, "body"> &
  Partial<Pick<EventColumns, "body">>;

export type EventRecordRow = Row<Contract, "admin.events.fetch">;

export type StaffRow = Row<Contract, "web.staff.list">;

export type StaffRecordRow = Row<Contract, "admin.staff.fetch">;

type SermonColumns = Row<Contract, "web.sermons.fetch">;

export type SermonRow = Omit<SermonColumns, "body"> &
  Partial<Pick<SermonColumns, "body">>;

export type ContentArguments = Arguments<Contract, "admin.content.update">;

export type ContentDraftArguments = Arguments<Contract, "admin.content.create">;

export type FolderRecordRow = Row<Contract, "admin.folders.fetch">;

export type FolderArguments = Arguments<Contract, "admin.folders.create">;

export type ViewRecordRow = Row<Contract, "admin.views.list">;

export type ViewArguments = Arguments<Contract, "admin.views.save">;

export type HomeArguments = Arguments<Contract, "admin.home.update">;

export type AboutArguments = Arguments<Contract, "admin.about.update">;

export type ConnectArguments = Arguments<Contract, "admin.connect.update">;

export type EventArguments = Arguments<Contract, "admin.events.create">;

export type StaffArguments = Arguments<Contract, "admin.staff.create">;

export type SermonArguments = Arguments<Contract, "admin.sermons.create">;

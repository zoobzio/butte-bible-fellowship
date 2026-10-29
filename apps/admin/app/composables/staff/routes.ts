import type { StaffRecord } from "@bbf/schema/types";

import type { RecordLink } from "~/types/listing";

/** The admin's API for the staff, and the pages that use it. */
export const ROUTE = "/api/staff";
export const BACK = "/staff";
export const endpoint = (id: number): string => `${ROUTE}/${id}`;

export const link: RecordLink<StaffRecord> = (record) => `/staff/${record.id}`;

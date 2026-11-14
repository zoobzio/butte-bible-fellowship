import type { ConnectPage, ConnectRecord } from "@bbf/schema/types";

import { hast } from "@bbf/schema";

import type { ConnectRecordRow, ConnectRow } from "../types";
import type { ContentDocument } from "./document";

import { toDocument } from "./document";

export const toConnectRecord = (row: ConnectRecordRow): ConnectRecord => ({
  title: row.title,
  description: row.description ?? undefined,
  address: row.address,
  phone: row.phone ?? undefined,
  fax: row.fax ?? undefined,
  email: row.email ?? undefined,
  hours: row.hours ?? undefined,
  body: row.body === null ? undefined : hast.parse(row.body),
  updatedAt: row.updated_at.toISOString(),
});

/**
 * The connect page as the site reads it: the title and the description it
 * opens with, and how to find and reach the church, as its front matter,
 * over what is written on it.
 */
export const toConnectDocument = (
  row: ConnectRow,
): ContentDocument<ConnectPage> =>
  toDocument(
    {
      title: row.title,
      description: row.description ?? undefined,
      address: row.address,
      phone: row.phone ?? undefined,
      fax: row.fax ?? undefined,
      email: row.email ?? undefined,
      hours: row.hours ?? undefined,
    },
    row.body,
  );

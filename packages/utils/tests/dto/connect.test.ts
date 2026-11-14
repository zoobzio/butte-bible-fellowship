import { connectPage, connectRecord } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toConnectDocument, toConnectRecord } from "../../src/dto/connect";

const BODY = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "h2",
      properties: {},
      children: [{ type: "text", value: "Come and See" }],
    },
  ],
};

const REACH = {
  address: "2255 Pillsbury Road, Chico, California 95926",
  phone: "530-892-0521",
  fax: "530-898-1851",
  email: "office@bbfchurchchico.org",
  hours: "Tuesday–Thursday: 9am–4pm\nFriday: 9am–noon",
};

const CONNECT = {
  title: "Connect",
  description: "We’d love to meet you.",
  ...REACH,
  body: BODY,
};

const BARE = {
  title: "Connect",
  description: null,
  address: REACH.address,
  phone: null,
  fax: null,
  email: null,
  hours: null,
  body: null,
};

const STAMP = { updated_at: new Date("2026-10-18T09:30:00.000Z") };

describe("toConnectRecord", () => {
  it("is the connect page as the admin reads it: every column, its date as text", () => {
    const record = toConnectRecord({ ...CONNECT, ...STAMP });
    expect(record).toEqual({
      ...CONNECT,
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
    expect(connectRecord.parse(record)).toEqual(record);
  });

  it("leaves out what the row has null in", () => {
    const record = toConnectRecord({ ...BARE, ...STAMP });
    expect(record).toEqual({
      title: "Connect",
      address: REACH.address,
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
    expect(connectRecord.safeParse(record).success).toBe(true);
  });

  it("refuses a body the schema would not accept", () => {
    expect(() =>
      toConnectRecord({ ...BARE, ...STAMP, body: "# Hi" }),
    ).toThrow();
  });
});

describe("toConnectDocument", () => {
  it("is the connect page as the site reads it: how to reach the church in its front matter, over what is written", () => {
    const document = toConnectDocument(CONNECT);
    expect(document.data.matter).toEqual({
      title: "Connect",
      description: "We’d love to meet you.",
      ...REACH,
    });
    expect(connectPage.parse(document.data.matter)).toEqual(
      document.data.matter,
    );
    expect(document.children).toMatchObject([
      { tagName: "h2", properties: { id: "come-and-see" } },
    ]);
  });

  it("is its title and address alone when nothing else is written", () => {
    expect(toConnectDocument(BARE)).toEqual({
      type: "root",
      data: { matter: { title: "Connect", address: REACH.address } },
      children: [],
    });
  });
});

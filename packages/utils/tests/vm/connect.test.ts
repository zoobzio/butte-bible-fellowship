import type { ConnectRecord } from "@bbf/schema/types";

import { connectBody, connectForm } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toConnectBody, toConnectForm } from "../../src/vm/connect";

const METADATA = {
  title: "Connect",
  description: "We’d love to meet you.",
  address: "2255 Pillsbury Road, Chico, California 95926",
  phone: "530-892-0521",
  fax: "530-898-1851",
  email: "office@bbfchurchchico.org",
  hours: "Tuesday–Thursday: 9am–4pm\nFriday: 9am–noon",
};

const CONNECT: ConnectRecord = {
  ...METADATA,
  body: { type: "root", children: [] },
  updatedAt: "2026-10-18T09:30:00.000Z",
};

describe("toConnectForm", () => {
  it("is the record's metadata as the form holds it, and nothing of what is written on it", () => {
    const form = toConnectForm(CONNECT);
    expect(form).toEqual(METADATA);
    expect(connectForm.safeParse(form).success).toBe(true);
  });

  it("leaves empty what the page says nothing of", () => {
    expect(
      toConnectForm({
        title: "Connect",
        address: METADATA.address,
        updatedAt: CONNECT.updatedAt,
      }),
    ).toEqual({
      title: "Connect",
      description: undefined,
      address: METADATA.address,
      phone: undefined,
      fax: undefined,
      email: undefined,
      hours: undefined,
    });
  });
});

describe("toConnectBody", () => {
  it("is the form as a body writes it: the record's metadata, back again", () => {
    const body = toConnectBody(toConnectForm(CONNECT));
    expect(body).toEqual(METADATA);
    expect(connectBody.parse(body)).toEqual(body);
  });

  it("trims what is written, the lines of the hours kept, and leaves out what is left empty", () => {
    expect(
      toConnectBody({
        title: "  Connect ",
        description: "   ",
        address: " 1 Main Street ",
        phone: " 530-892-0521 ",
        fax: "",
        email: undefined,
        hours: "\nMonday: closed\nFriday: 9am–noon\n",
      }),
    ).toEqual({
      title: "Connect",
      description: undefined,
      address: "1 Main Street",
      phone: "530-892-0521",
      fax: undefined,
      email: undefined,
      hours: "Monday: closed\nFriday: 9am–noon",
    });
  });
});

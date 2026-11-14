import { connectBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toConnectArguments } from "../../src/dao/connect";

const BARE = { title: "Connect", address: "2255 Pillsbury Road, Chico" };

describe("toConnectArguments", () => {
  it("writes every line left out as null", () => {
    expect(toConnectArguments(connectBody.parse(BARE))).toEqual({
      ...BARE,
      description: null,
      phone: null,
      fax: null,
      email: null,
      hours: null,
    });
  });

  it("carries every field a body says", () => {
    const body = connectBody.parse({
      ...BARE,
      description: "We’d love to meet you.",
      phone: "530-892-0521",
      fax: "530-898-1851",
      email: "office@bbfchurchchico.org",
      hours: "Friday: 9am–noon",
    });
    expect(toConnectArguments(body)).toEqual(body);
  });
});

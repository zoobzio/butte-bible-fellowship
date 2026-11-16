import { staffViewBody, viewPath } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toViewArguments } from "../../src/dao/view";

const ID = "0b1f4c4e-6f0a-4d0e-9a57-3f0c1c2d4e5f";

describe("toViewArguments", () => {
  it("is a save of a view: whose it is, the list and the id, the name and the payload", () => {
    const path = viewPath.parse({ surface: "staff", id: ID });
    const body = staffViewBody.parse({
      name: " Elders ",
      payload: { sorting: [{ id: "name", desc: true }] },
    });
    expect(toViewArguments("117", path, body)).toEqual({
      sub: "117",
      surface: "staff",
      id: ID,
      name: "Elders",
      payload: body.payload,
    });
  });
});

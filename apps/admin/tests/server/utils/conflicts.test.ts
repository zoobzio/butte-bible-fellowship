import { describe, expect, it } from "vitest";

import { constraintOf, orRefused } from "~~/server/utils/conflicts";

/* A write the database refused, as its service throws it. */
const refused = (constraint: string) =>
  new Error("the query failed", { cause: { constraint } });

describe("constraintOf", () => {
  it("reads the constraint a write ran into, off the error or what caused it", () => {
    expect(constraintOf({ constraint: "folders_name_check" })).toBe(
      "folders_name_check",
    );
    expect(constraintOf(refused("folders_parent_id_name_key"))).toBe(
      "folders_parent_id_name_key",
    );
  });

  it("reads none off an error that names none, or off no error at all", () => {
    expect(constraintOf(new Error("nope"))).toBeUndefined();
    expect(constraintOf("nope")).toBeUndefined();
    expect(constraintOf(null)).toBeUndefined();
  });
});

describe("orRefused", () => {
  const REFUSALS = { taken_key: "taken", gone_fkey: "gone" } as const;

  it("hands back what the write answers", async () => {
    expect(await orRefused(REFUSALS, async () => 3)).toBe(3);
  });

  it("hands back the word for the constraint the write ran into", async () => {
    expect(
      await orRefused(REFUSALS, async () => {
        throw refused("taken_key");
      }),
    ).toBe("taken");
    expect(
      await orRefused(REFUSALS, async () => {
        throw refused("gone_fkey");
      }),
    ).toBe("gone");
  });

  it("throws on whatever else fails the write", async () => {
    const other = refused("other_check");
    await expect(
      orRefused(REFUSALS, async () => {
        throw other;
      }),
    ).rejects.toBe(other);
    await expect(
      orRefused(REFUSALS, async () => {
        throw new Error("down");
      }),
    ).rejects.toThrow("down");
    await expect(
      orRefused(REFUSALS, async () => {
        throw refused("toString");
      }),
    ).rejects.toBeInstanceOf(Error);
  });
});

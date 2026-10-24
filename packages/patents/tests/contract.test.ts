import { describe, expect, expectTypeOf, it } from "vitest";

import { defineSchema } from "letters-patent";

import config, { type Contract } from "../.output/config.mjs";
import { isRole, isScope, roles, scopes } from "../.output/index.mjs";
import google from "../.output/issuers/google.mjs";
import { issuers } from "../.output/issuers.mjs";
import { manifest } from "../.output/manifest.mjs";
import resource from "../src/resource.json" with { type: "json" };
import claims from "../src/claims.json" with { type: "json" };

describe("the built contract", () => {
  it("carries the vocabularies of the documents", () => {
    expect(scopes).toEqual(resource.scopes_supported);
    expect(roles).toEqual(claims.id_token.roles.values);
    expect(isScope("staff:write")).toBe(true);
    expect(isScope("staff:delete")).toBe(false);
    expect(isRole("admin")).toBe(true);
  });

  it("types the vocabularies as literals", () => {
    expectTypeOf<Contract["roles"]>().toEqualTypeOf<
      readonly ["admin", "editor"]
    >();
  });

  it("derives a schema that rules a user", () => {
    const schema = defineSchema<Contract>(config.contract);
    expect(schema.check.user({ sub: "u", roles: ["editor"], meta: {} })).toBe(
      true,
    );
    expect(schema.check.user({ sub: "u", roles: ["owner"], meta: {} })).toBe(
      false,
    );
  });

  it("describes every scope and role", () => {
    for (const entry of [...manifest.scopes, ...manifest.roles]) {
      expect(entry.description, entry.id).toBeTruthy();
    }
  });

  it("knows its issuer", () => {
    expect(issuers).toEqual([
      { id: "google", issuer: "https://accounts.google.com" },
    ]);
    expect(google.caps.pkce).toBe(true);
  });
});

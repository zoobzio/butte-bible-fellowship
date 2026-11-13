import { describe, expect, it } from "vitest";

import { setAppConfig } from "#imports";
import { useConnect } from "~/composables/contact";

describe("useConnect", () => {
  it("is how to find and reach the church, its phone and email each with the link that calls or writes", () => {
    setAppConfig({
      contact: {
        address: "1 Test Street, Testville",
        phone: "555-010-0100",
        email: "office@test.example",
      },
      connect: {
        address: "1 Test Street, Testville, California 90000",
        fax: "555-010-0199",
        map: "https://maps.example.com/embed",
      },
    });
    expect(useConnect()).toEqual({
      address: "1 Test Street, Testville, California 90000",
      fax: "555-010-0199",
      map: "https://maps.example.com/embed",
      phone: { text: "555-010-0100", href: "tel:5550100100" },
      email: {
        text: "office@test.example",
        href: "mailto:office@test.example",
      },
    });
  });
});

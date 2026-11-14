import { describe, expect, it } from "vitest";

import { emailHref, mapSrc, phoneHref, toConnect } from "~/utils/contact";

describe("phoneHref", () => {
  it("calls a number by its digits alone", () => {
    expect(phoneHref("530-892-0521")).toBe("tel:5308920521");
    expect(phoneHref("(530) 892 0521")).toBe("tel:5308920521");
  });
});

describe("emailHref", () => {
  it("writes to the address", () => {
    expect(emailHref("office@example.org")).toBe("mailto:office@example.org");
  });
});

describe("mapSrc", () => {
  it("is the map a frame embeds, drawn around the address as it is written", () => {
    expect(mapSrc("2255 Pillsbury Road, Chico, California 95926")).toBe(
      "https://maps.google.com/maps?q=2255%20Pillsbury%20Road%2C%20Chico%2C%20California%2095926&t=m&z=13&output=embed&iwloc=near",
    );
  });
});

describe("toConnect", () => {
  const PAGE = {
    title: "Connect",
    address: "1 Test Street, Testville, California 90000",
  };

  it("is how to find and reach the church, its phone and email each with the link that calls or writes, its hours a line each", () => {
    expect(
      toConnect({
        ...PAGE,
        phone: "555-010-0100",
        fax: "555-010-0199",
        email: "office@test.example",
        hours: "Tuesday–Thursday: 9am–4pm\n\n  Friday: 9am–noon \n",
      }),
    ).toEqual({
      address: PAGE.address,
      map: mapSrc(PAGE.address),
      phone: { text: "555-010-0100", href: "tel:5550100100" },
      fax: "555-010-0199",
      email: {
        text: "office@test.example",
        href: "mailto:office@test.example",
      },
      hours: ["Tuesday–Thursday: 9am–4pm", "Friday: 9am–noon"],
    });
  });

  it("leaves out what the page says nothing of: an address and its map alone, and no hours", () => {
    expect(toConnect(PAGE)).toEqual({
      address: PAGE.address,
      map: mapSrc(PAGE.address),
      phone: undefined,
      fax: undefined,
      email: undefined,
      hours: [],
    });
  });
});

import { homeBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toHomeArguments } from "../../src/dao/home";

const HEADING = "Discover God’s **Love**";

const HOME = {
  title: "Butte Bible Fellowship",
  heroHeading: HEADING,
  heroDescription: "Join us.",
  heroAction: "Learn More",
  heroLink: "/about-us",
};

const COLUMNS = {
  title: "Butte Bible Fellowship",
  hero_heading: HEADING,
  hero_description: "Join us.",
  hero_action: "Learn More",
  hero_link: "/about-us",
};

describe("toHomeArguments", () => {
  it("names each field by its column, and writes a description left out as null", () => {
    expect(toHomeArguments(homeBody.parse(HOME))).toEqual({
      ...COLUMNS,
      description: null,
    });
  });

  it("carries every field a body says, and no picture: that is written on its own", () => {
    const body = homeBody.parse({ ...HOME, description: "A local church." });
    const written = toHomeArguments(body);
    expect(written).toEqual({ ...COLUMNS, description: "A local church." });
    expect(written).not.toHaveProperty("hero_image");
  });
});

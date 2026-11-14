import { describe, expect, it } from "vitest";

import { link } from "../../src/models/link";

describe("link", () => {
  it("is a path of the site, from its root", () => {
    for (const path of ["/", "/about-us", "/images/church.jpg", "/a#b?c=d"]) {
      expect(link.parse(path), path).toBe(path);
    }
  });

  it("is a web address in full", () => {
    for (const address of [
      "https://example.com/church.jpg",
      "http://example.com",
    ]) {
      expect(link.parse(address), address).toBe(address);
    }
  });

  it("is nothing else", () => {
    for (const value of [
      "",
      "about-us",
      "images/church.jpg",
      "/about us",
      "mailto:office@example.com",
      "javascript:alert(1)",
      " /about-us",
    ]) {
      expect(link.safeParse(value).success, value).toBe(false);
    }
  });
});

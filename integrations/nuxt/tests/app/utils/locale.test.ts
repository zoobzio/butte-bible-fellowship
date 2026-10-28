import { describe, expect, it } from "vitest";

import { languageName } from "#layers/bbf/app/utils/locale";

describe("languageName", () => {
  it("names a language in that language, capitalized", () => {
    expect(languageName("en")).toBe("English");
    expect(languageName("es")).toBe("Español");
    expect(languageName("fr")).toBe("Français");
  });
});

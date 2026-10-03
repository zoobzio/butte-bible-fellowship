import { describe, expect, it } from "vitest";
import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";
import config from "@bbf/theme/config";

import { loadTheme, siteTheme, themes } from "../../server/aurora";
import { files } from "../../server/aurora/files";

const untheme = makeUntheme(useUnthemeConfig(config));

describe("theme catalog", () => {
  it("lists the site's theme and every theme with files", () => {
    expect(themes).toContainEqual({
      id: "bbf",
      name: "Butte Bible Fellowship",
    });
    expect(themes.map((theme) => theme.id).sort()).toEqual(
      ["bbf", ...Object.keys(files)].sort(),
    );
    expect(new Set(themes.map((theme) => theme.id)).size).toBe(themes.length);
  });

  it("serves the site's theme as a layer that rebinds nothing", async () => {
    expect(await loadTheme(siteTheme.id)).toEqual({
      id: config.theme.id,
      name: config.theme.name,
      tokens: {},
    });
  });

  it("serves every listed theme as a layer the app's contract accepts", async () => {
    for (const { id, name } of themes) {
      const layer = await loadTheme(id);
      expect(layer, id).toMatchObject({ id, name });
      expect(() => untheme.create(layer as never), id).not.toThrow();
    }
  });

  it("serves an aurora theme's ramp values as its bindings", async () => {
    const layer = await loadTheme("nord");
    const ramp = (await files.nord!["colors/primary.json"]!()).default;
    expect(Object.keys(layer!.tokens).length).toBe(220);
    expect(layer!.tokens["primary-600"]).toEqual(ramp["primary-600"]!.$value);
  });

  it("answers nothing for a theme it does not serve", async () => {
    expect(await loadTheme("no-such-theme")).toBeUndefined();
  });
});

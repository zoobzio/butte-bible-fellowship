import { hast } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toHast } from "../../src/dto/hast";

describe("toHast", () => {
  it("builds the tree the app renders, as the pages are built", () => {
    expect(toHast("## Jane\n\nServing **since 2010**.")).toEqual({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: { id: "jane" },
          children: [{ type: "text", value: "Jane" }],
        },
        { type: "text", value: "\n" },
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [
            { type: "text", value: "Serving " },
            {
              type: "element",
              tagName: "strong",
              properties: {},
              children: [{ type: "text", value: "since 2010" }],
            },
            { type: "text", value: "." },
          ],
        },
      ],
    });
  });

  it("carries no position, at any depth", () => {
    const json = JSON.stringify(
      toHast(
        "# A\n\n- one\n- *two*\n\n> quoted\n\n::invite-grid\n:::invite-card\nx\n:::\n::",
      ),
    );
    expect(json).not.toContain('"position"');
  });

  it("carries an element's attributes, and none that is unset", () => {
    const [list] = toHast("- [ ] task").children;
    expect(list).toMatchObject({
      tagName: "ul",
      properties: { className: ["contains-task-list"] },
    });
    const [item] = (list as { children: unknown[] }).children.filter(
      (child) => (child as { type: string }).type === "element",
    );
    expect(item).toMatchObject({
      tagName: "li",
      properties: { className: ["task-list-item"] },
    });
    const walk = (node: unknown): void => {
      if (typeof node !== "object" || node === null) return;
      const { properties, children } = node as {
        properties?: Record<string, unknown>;
        children?: unknown[];
      };
      for (const value of Object.values(properties ?? {})) {
        expect(value).not.toBeUndefined();
      }
      children?.forEach(walk);
    };
    walk(toHast("- [ ] task\n\n<!-- gone -->\n\n<b>raw</b>"));
  });

  it("builds what the schema accepts, from all the pages' syntax", () => {
    const tree = toHast(
      '# A\n\n| a | b |\n| - | - |\n| 1 | 2 |\n\n- [ ] task\n\n::map-embed{src="/map"}\n\nSee [us](/connect) at ~~9~~ 10.\n\n<!-- a comment -->\n\n<b>raw</b>',
    );
    expect(hast.safeParse(tree).success).toBe(true);
  });

  it("builds nothing from nothing", () => {
    expect(toHast("")).toEqual({ type: "root", children: [] });
  });
});

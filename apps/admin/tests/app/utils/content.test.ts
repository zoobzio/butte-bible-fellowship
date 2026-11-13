import type { Hast } from "@bbf/schema/types";

import { describe, expect, it } from "vitest";

import { toPageBody } from "~/utils/content";

type Node = Hast["children"][number];

const element = (
  tagName: string,
  properties: Record<string, string | string[]> = {},
  ...children: (Node | string)[]
): Node => ({
  type: "element",
  tagName,
  properties,
  children: children.map((child) =>
    typeof child === "string" ? { type: "text", value: child } : child,
  ),
});

const tree = (...children: Node[]): Hast => ({ type: "root", children });

describe("toPageBody", () => {
  it("keeps what is written as it is", () => {
    const body = tree(
      element("h2", {}, "Visit Us"),
      element("p", {}, element("strong", {}, "Phone:"), " 530-892-0521"),
      element("div", { dataDirective: "map-embed", dataSrc: "https://maps" }),
    );
    expect(toPageBody(body)).toEqual(body);
  });

  it("writes a link as it was written, not to open in a tab of its own", () => {
    const link = (properties: Record<string, string | string[]>) =>
      tree(
        element(
          "div",
          { dataDirective: "connect-card" },
          element("p", {}, element("a", properties, "Call")),
        ),
      );
    expect(
      toPageBody(
        link({
          target: "_blank",
          rel: ["noopener", "noreferrer", "nofollow"],
          href: "tel:5308920521",
        }),
      ),
    ).toEqual(link({ href: "tel:5308920521" }));
  });

  it("drops the empty paragraphs the editor leaves after a closing block, and no other", () => {
    const card = element("div", { dataDirective: "invite-card" });
    expect(
      toPageBody(
        tree(element("p"), element("p", {}, "Welcome."), card, element("p")),
      ),
    ).toEqual(tree(element("p"), element("p", {}, "Welcome."), card));
    expect(toPageBody(tree(element("p"), element("p")))).toEqual(tree());
  });

  it("leaves the tree it was handed as it was", () => {
    const body = tree(element("p", {}, element("a", { target: "_blank" })));
    toPageBody(body);
    expect(body).toEqual(
      tree(element("p", {}, element("a", { target: "_blank" }))),
    );
  });
});

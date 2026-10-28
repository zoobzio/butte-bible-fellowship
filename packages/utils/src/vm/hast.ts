import type { Hast } from "@bbf/schema/types";

import { fromHtml as parse } from "hast-util-from-html";
import { toHtml as render } from "hast-util-to-html";

import { toContent } from "../hast";

export const toHtml = (tree: Hast): string => render(tree);

export const fromHtml = (html: string): Hast => ({
  type: "root",
  children: parse(html, { fragment: true }).children.flatMap(toContent),
});

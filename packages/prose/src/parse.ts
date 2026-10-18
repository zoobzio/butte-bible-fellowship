import type { Hast } from "@prosary/parse";

import { definePipeline } from "@prosary/parse";

import config from "../prosary.config";

/**
 * The pipeline the pages are built with, as `prosary.config.ts` lists its
 * presets: GitHub Flavored Markdown, the MDC blocks the site sets, an id on
 * every heading. Built once, as the module loads.
 */
const pipeline = definePipeline({ presets: config.content.presets });

/**
 * Markdown as the pages are built: the HTML tree the app renders, read with
 * the same presets, so a bio or an event's body written for the API renders
 * as a page does. The tree is the pipeline's own, the position of each node
 * included; what goes over the wire is `@bbf/utils`'s to shape.
 */
export const parse = (markdown: string): Hast => pipeline.build(markdown);

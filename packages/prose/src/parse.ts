import type { Hast } from "@prosary/parse";

import { definePipeline } from "@prosary/parse";

import config from "../prosary.config";

const pipeline = definePipeline({ presets: config.content.presets });

export const parse = (markdown: string): Hast => pipeline.build(markdown);

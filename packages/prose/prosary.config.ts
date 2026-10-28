import { defineConfig } from "@prosary/kit/config";
import { gfm, matter, mdc } from "@prosary/parse/plugins";
import rehypeSlug from "rehype-slug";

export default defineConfig({
  messages: "src/messages",
  content: {
    dir: "src/content",
    presets: [matter(), gfm(), mdc(), { rehype: [rehypeSlug] }],
  },
  translate: {
    source: "en",
    targets: ["es", "fr"],
    cache: ".cache",
    model: "anthropic/claude-sonnet-5-5",
  },
  outDir: ".output",
});

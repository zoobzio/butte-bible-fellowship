import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import js from "@terrazzo/plugin-js";

export default defineConfig({
  tokens: ["./resolver.json"],
  outDir: "./dist/",
  plugins: [
    css({
      filename: "index.css",
      permutations: [
        {
          input: { color: "light" },
          prepare: (contents) => `:root {\n  ${contents}\n}`,
        },
        {
          // Only the color roles change between schemes; everything else
          // stays declared once on :root.
          input: { color: "dark" },
          include: ["color.**"],
          prepare: (contents) =>
            `:root[data-color="dark"] {\n  ${contents}\n}`,
        },
      ],
    }),
    js({ filename: "index.js" }),
  ],
});

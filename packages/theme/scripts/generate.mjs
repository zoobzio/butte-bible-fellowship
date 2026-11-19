import { writeFile } from "node:fs/promises";

import { palette } from "@untheme/aurora/ramp";

import { seeds } from "../src/seeds.mjs";

const BBF = {
  name: "Butte Bible Fellowship",
  description: "Brand blue, sunset orange and yellow on warm greys",
  seeds,
};

await writeFile(
  new URL("../src/bbf.json", import.meta.url),
  `${JSON.stringify(palette(BBF), null, 2)}\n`,
);

console.log("generated src/bbf.json");

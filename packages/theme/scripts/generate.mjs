import { writeFile } from "node:fs/promises";

import { palette } from "@untheme/aurora/ramp";

const BBF = {
  name: "Butte Bible Fellowship",
  description: "Brand blue, sunset orange and yellow on warm greys",
  seeds: {
    primary: "#0a68ff",
    secondary: "#ff9a5c",
    tertiary: "#ffde59",
    error: "#dc4a5e",
    success: "#57a53c",
    warning: "#c08a1f",
    neutral: "#7e7871",
    "neutral-variant": "#85776d",
  },
};

await writeFile(
  new URL("../src/bbf.json", import.meta.url),
  `${JSON.stringify(palette(BBF), null, 2)}\n`,
);

console.log("generated src/bbf.json");

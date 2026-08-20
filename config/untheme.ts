import { defineUnthemeConfig } from "@untheme/nuxt/config";
import { preset } from "@untheme/aurora";

/**
 * Aurora widened with the design pass's structural changes: Work Sans text,
 * a Newsreader display serif on the display/headline/title styles, a larger
 * display size, a warm-tinted low elevation, and a three-stop brand
 * gradient. Gradient tokens carry stops only — the design's 108deg angle is
 * not expressible in the token schema; usage sites that need the angle must
 * inline it.
 */
const bbf = preset.configure({
  id: "bbf",
  name: "Butte Bible Fellowship",
  tokens: {
    "font-display": {
      $type: "fontFamily",
      $value: ["Newsreader", "Georgia", "serif"],
    },
    "font-sans": ["Work Sans", "system-ui", "sans-serif"],
    "display-size": { value: 3.25, unit: "rem" },
    "type-display": {
      fontFamily: "{font-display}",
      fontSize: "{display-size}",
      fontWeight: "{weight-regular}",
      letterSpacing: { value: -0.25, unit: "px" },
      lineHeight: "{display-line-height}",
    },
    "type-headline": {
      fontFamily: "{font-display}",
      fontSize: "{headline-size}",
      fontWeight: "{weight-medium}",
      letterSpacing: { value: 0, unit: "px" },
      lineHeight: "{headline-line-height}",
    },
    "type-title": {
      fontFamily: "{font-display}",
      fontSize: "{title-size}",
      fontWeight: "{weight-regular}",
      letterSpacing: { value: 0, unit: "px" },
      lineHeight: "{title-line-height}",
    },
    "elevation-low": {
      color: {
        colorSpace: "srgb",
        components: [0.16, 0.11, 0.06],
        alpha: 0.16,
      },
      offsetX: { value: 0, unit: "px" },
      offsetY: { value: 1, unit: "px" },
      blur: { value: 2, unit: "px" },
      spread: { value: 0, unit: "px" },
    },
    "gradient-brand": [
      { color: "{primary-500}", position: 0 },
      { color: "{warning-400}", position: 0.52 },
      { color: "{tertiary-500}", position: 1 },
    ],
  },
  modifiers: {
    color: {
      light: {
        // Parchment surfaces from the design pass's token update — literal
        // values, deliberately off the neutral ramp (design/updated-tokens).
        surface: {
          colorSpace: "srgb",
          components: [0.98431, 0.96078, 0.92549],
          hex: "#fbf5ec",
        },
        "surface-container": {
          colorSpace: "srgb",
          components: [0.95686, 0.92157, 0.86667],
          hex: "#f4ebdd",
        },
        "surface-container-high": {
          colorSpace: "srgb",
          components: [0.92157, 0.87451, 0.80392],
          hex: "#ebdfcd",
        },
      },
    },
  },
  order: [],
});

/**
 * The site palette from the design pass: warm terracotta primary, dusty
 * lavender secondary, sage tertiary, warm neutrals. Generated from
 * design/preview/themes.css — regenerate rather than hand-editing.
 */
export default defineUnthemeConfig({
  theme: bbf.define({
    id: "bbf",
    name: "Butte Bible Fellowship",
    tokens: {
    "primary-50": {
      colorSpace: "srgb",
      components: [0.99216, 0.95686, 0.92941],
      hex: "#fdf4ed",
    },
    "primary-100": {
      colorSpace: "srgb",
      components: [0.99608, 0.90588, 0.83922],
      hex: "#fee7d6",
    },
    "primary-200": {
      colorSpace: "srgb",
      components: [0.97647, 0.81569, 0.69804],
      hex: "#f9d0b2",
    },
    "primary-300": {
      colorSpace: "srgb",
      components: [0.92941, 0.70588, 0.53725],
      hex: "#edb489",
    },
    "primary-400": {
      colorSpace: "srgb",
      components: [0.86275, 0.59608, 0.38824],
      hex: "#dc9863",
    },
    "primary-500": {
      colorSpace: "srgb",
      components: [0.76471, 0.49412, 0.27451],
      hex: "#c37e46",
    },
    "primary-600": {
      colorSpace: "srgb",
      components: [0.65882, 0.40392, 0.19216],
      hex: "#a86731",
    },
    "primary-700": {
      colorSpace: "srgb",
      components: [0.53725, 0.32157, 0.13333],
      hex: "#895222",
    },
    "primary-800": {
      colorSpace: "srgb",
      components: [0.42353, 0.24314, 0.08627],
      hex: "#6c3e16",
    },
    "primary-900": {
      colorSpace: "srgb",
      components: [0.3098, 0.16863, 0.05098],
      hex: "#4f2b0d",
    },
    "primary-950": {
      colorSpace: "srgb",
      components: [0.22745, 0.11765, 0.02353],
      hex: "#3a1e06",
    },
    "primary-muted-50": {
      colorSpace: "srgb",
      components: [0.98039, 0.96078, 0.9451],
      hex: "#faf5f1",
    },
    "primary-muted-100": {
      colorSpace: "srgb",
      components: [0.95294, 0.91373, 0.88627],
      hex: "#f3e9e2",
    },
    "primary-muted-200": {
      colorSpace: "srgb",
      components: [0.90588, 0.83529, 0.78824],
      hex: "#e7d5c9",
    },
    "primary-muted-300": {
      colorSpace: "srgb",
      components: [0.83137, 0.73725, 0.67059],
      hex: "#d4bcab",
    },
    "primary-muted-400": {
      colorSpace: "srgb",
      components: [0.75294, 0.63922, 0.55686],
      hex: "#c0a38e",
    },
    "primary-muted-500": {
      colorSpace: "srgb",
      components: [0.6549, 0.54118, 0.45882],
      hex: "#a78a75",
    },
    "primary-muted-600": {
      colorSpace: "srgb",
      components: [0.55686, 0.45098, 0.37255],
      hex: "#8e735f",
    },
    "primary-muted-700": {
      colorSpace: "srgb",
      components: [0.45098, 0.36078, 0.2902],
      hex: "#735c4a",
    },
    "primary-muted-800": {
      colorSpace: "srgb",
      components: [0.35294, 0.27451, 0.21961],
      hex: "#5a4638",
    },
    "primary-muted-900": {
      colorSpace: "srgb",
      components: [0.2549, 0.19608, 0.15294],
      hex: "#413227",
    },
    "primary-muted-950": {
      colorSpace: "srgb",
      components: [0.18431, 0.13725, 0.10588],
      hex: "#2f231b",
    },
    "primary-vivid-50": {
      colorSpace: "srgb",
      components: [0.99216, 0.95686, 0.92941],
      hex: "#fdf4ed",
    },
    "primary-vivid-100": {
      colorSpace: "srgb",
      components: [1.0, 0.90196, 0.83529],
      hex: "#ffe6d5",
    },
    "primary-vivid-200": {
      colorSpace: "srgb",
      components: [1.0, 0.80784, 0.66275],
      hex: "#ffcea9",
    },
    "primary-vivid-300": {
      colorSpace: "srgb",
      components: [0.99216, 0.67843, 0.42745],
      hex: "#fdad6d",
    },
    "primary-vivid-400": {
      colorSpace: "srgb",
      components: [0.93333, 0.55686, 0.22353],
      hex: "#ee8e39",
    },
    "primary-vivid-500": {
      colorSpace: "srgb",
      components: [0.83529, 0.4549, 0.02745],
      hex: "#d57407",
    },
    "primary-vivid-600": {
      colorSpace: "srgb",
      components: [0.70196, 0.37647, 0.01176],
      hex: "#b36003",
    },
    "primary-vivid-700": {
      colorSpace: "srgb",
      components: [0.56863, 0.30196, 0.00784],
      hex: "#914d02",
    },
    "primary-vivid-800": {
      colorSpace: "srgb",
      components: [0.44314, 0.23137, 0.00392],
      hex: "#713b01",
    },
    "primary-vivid-900": {
      colorSpace: "srgb",
      components: [0.31765, 0.16471, 0.01569],
      hex: "#512a04",
    },
    "primary-vivid-950": {
      colorSpace: "srgb",
      components: [0.23529, 0.11373, 0.0],
      hex: "#3c1d00",
    },
    "secondary-50": {
      colorSpace: "srgb",
      components: [0.96863, 0.95686, 0.98824],
      hex: "#f7f4fc",
    },
    "secondary-100": {
      colorSpace: "srgb",
      components: [0.93333, 0.9098, 0.97255],
      hex: "#eee8f8",
    },
    "secondary-200": {
      colorSpace: "srgb",
      components: [0.86667, 0.83137, 0.93725],
      hex: "#ddd4ef",
    },
    "secondary-300": {
      colorSpace: "srgb",
      components: [0.78431, 0.72941, 0.87843],
      hex: "#c8bae0",
    },
    "secondary-400": {
      colorSpace: "srgb",
      components: [0.69412, 0.62745, 0.80392],
      hex: "#b1a0cd",
    },
    "secondary-500": {
      colorSpace: "srgb",
      components: [0.59608, 0.52941, 0.7098],
      hex: "#9887b5",
    },
    "secondary-600": {
      colorSpace: "srgb",
      components: [0.50196, 0.43922, 0.60392],
      hex: "#80709a",
    },
    "secondary-700": {
      colorSpace: "srgb",
      components: [0.40392, 0.34902, 0.49412],
      hex: "#67597e",
    },
    "secondary-800": {
      colorSpace: "srgb",
      components: [0.31373, 0.26667, 0.38824],
      hex: "#504463",
    },
    "secondary-900": {
      colorSpace: "srgb",
      components: [0.22353, 0.18824, 0.28235],
      hex: "#393048",
    },
    "secondary-950": {
      colorSpace: "srgb",
      components: [0.16078, 0.13333, 0.20392],
      hex: "#292234",
    },
    "secondary-muted-50": {
      colorSpace: "srgb",
      components: [0.96471, 0.96078, 0.97255],
      hex: "#f6f5f8",
    },
    "secondary-muted-100": {
      colorSpace: "srgb",
      components: [0.92549, 0.91765, 0.9451],
      hex: "#eceaf1",
    },
    "secondary-muted-200": {
      colorSpace: "srgb",
      components: [0.85882, 0.84314, 0.88627],
      hex: "#dbd7e2",
    },
    "secondary-muted-300": {
      colorSpace: "srgb",
      components: [0.76863, 0.7451, 0.80784],
      hex: "#c4bece",
    },
    "secondary-muted-400": {
      colorSpace: "srgb",
      components: [0.67451, 0.64706, 0.72157],
      hex: "#aca5b8",
    },
    "secondary-muted-500": {
      colorSpace: "srgb",
      components: [0.58039, 0.55294, 0.62745],
      hex: "#948da0",
    },
    "secondary-muted-600": {
      colorSpace: "srgb",
      components: [0.48627, 0.45882, 0.52941],
      hex: "#7c7587",
    },
    "secondary-muted-700": {
      colorSpace: "srgb",
      components: [0.38824, 0.36863, 0.42745],
      hex: "#635e6d",
    },
    "secondary-muted-800": {
      colorSpace: "srgb",
      components: [0.30196, 0.28235, 0.33333],
      hex: "#4d4855",
    },
    "secondary-muted-900": {
      colorSpace: "srgb",
      components: [0.21569, 0.2, 0.23922],
      hex: "#37333d",
    },
    "secondary-muted-950": {
      colorSpace: "srgb",
      components: [0.15294, 0.14118, 0.17255],
      hex: "#27242c",
    },
    "secondary-vivid-50": {
      colorSpace: "srgb",
      components: [0.97255, 0.95294, 1.0],
      hex: "#f8f3ff",
    },
    "secondary-vivid-100": {
      colorSpace: "srgb",
      components: [0.93725, 0.90588, 0.99216],
      hex: "#efe7fd",
    },
    "secondary-vivid-200": {
      colorSpace: "srgb",
      components: [0.87451, 0.81961, 0.96863],
      hex: "#dfd1f7",
    },
    "secondary-vivid-300": {
      colorSpace: "srgb",
      components: [0.79608, 0.71373, 0.92549],
      hex: "#cbb6ec",
    },
    "secondary-vivid-400": {
      colorSpace: "srgb",
      components: [0.70588, 0.60784, 0.85882],
      hex: "#b49bdb",
    },
    "secondary-vivid-500": {
      colorSpace: "srgb",
      components: [0.61176, 0.5098, 0.76471],
      hex: "#9c82c3",
    },
    "secondary-vivid-600": {
      colorSpace: "srgb",
      components: [0.51373, 0.41961, 0.65882],
      hex: "#836ba8",
    },
    "secondary-vivid-700": {
      colorSpace: "srgb",
      components: [0.41569, 0.33333, 0.53725],
      hex: "#6a5589",
    },
    "secondary-vivid-800": {
      colorSpace: "srgb",
      components: [0.32157, 0.2549, 0.42353],
      hex: "#52416c",
    },
    "secondary-vivid-900": {
      colorSpace: "srgb",
      components: [0.23137, 0.18039, 0.3098],
      hex: "#3b2e4f",
    },
    "secondary-vivid-950": {
      colorSpace: "srgb",
      components: [0.16471, 0.12549, 0.22745],
      hex: "#2a203a",
    },
    "tertiary-50": {
      colorSpace: "srgb",
      components: [0.95294, 0.96863, 0.93725],
      hex: "#f3f7ef",
    },
    "tertiary-100": {
      colorSpace: "srgb",
      components: [0.90588, 0.93725, 0.87451],
      hex: "#e7efdf",
    },
    "tertiary-200": {
      colorSpace: "srgb",
      components: [0.82353, 0.87059, 0.76471],
      hex: "#d2dec3",
    },
    "tertiary-300": {
      colorSpace: "srgb",
      components: [0.71765, 0.78824, 0.63529],
      hex: "#b7c9a2",
    },
    "tertiary-400": {
      colorSpace: "srgb",
      components: [0.61569, 0.69804, 0.51765],
      hex: "#9db284",
    },
    "tertiary-500": {
      colorSpace: "srgb",
      components: [0.51765, 0.6, 0.41569],
      hex: "#84996a",
    },
    "tertiary-600": {
      colorSpace: "srgb",
      components: [0.42745, 0.50588, 0.32941],
      hex: "#6d8154",
    },
    "tertiary-700": {
      colorSpace: "srgb",
      components: [0.34118, 0.40784, 0.2549],
      hex: "#576841",
    },
    "tertiary-800": {
      colorSpace: "srgb",
      components: [0.25882, 0.31765, 0.19216],
      hex: "#425131",
    },
    "tertiary-900": {
      colorSpace: "srgb",
      components: [0.18431, 0.22745, 0.12941],
      hex: "#2f3a21",
    },
    "tertiary-950": {
      colorSpace: "srgb",
      components: [0.12941, 0.16078, 0.08627],
      hex: "#212916",
    },
    "tertiary-muted-50": {
      colorSpace: "srgb",
      components: [0.96078, 0.96471, 0.95294],
      hex: "#f5f6f3",
    },
    "tertiary-muted-100": {
      colorSpace: "srgb",
      components: [0.91765, 0.92941, 0.90196],
      hex: "#eaede6",
    },
    "tertiary-muted-200": {
      colorSpace: "srgb",
      components: [0.83922, 0.85882, 0.81569],
      hex: "#d6dbd0",
    },
    "tertiary-muted-300": {
      colorSpace: "srgb",
      components: [0.74118, 0.77255, 0.7098],
      hex: "#bdc5b5",
    },
    "tertiary-muted-400": {
      colorSpace: "srgb",
      components: [0.64314, 0.67843, 0.60392],
      hex: "#a4ad9a",
    },
    "tertiary-muted-500": {
      colorSpace: "srgb",
      components: [0.5451, 0.58431, 0.50588],
      hex: "#8b9581",
    },
    "tertiary-muted-600": {
      colorSpace: "srgb",
      components: [0.4549, 0.48627, 0.41569],
      hex: "#747c6a",
    },
    "tertiary-muted-700": {
      colorSpace: "srgb",
      components: [0.36471, 0.39216, 0.32941],
      hex: "#5d6454",
    },
    "tertiary-muted-800": {
      colorSpace: "srgb",
      components: [0.27843, 0.30196, 0.25098],
      hex: "#474d40",
    },
    "tertiary-muted-900": {
      colorSpace: "srgb",
      components: [0.2, 0.21569, 0.17647],
      hex: "#33372d",
    },
    "tertiary-muted-950": {
      colorSpace: "srgb",
      components: [0.14118, 0.15294, 0.12549],
      hex: "#242720",
    },
    "tertiary-vivid-50": {
      colorSpace: "srgb",
      components: [0.94902, 0.97255, 0.92941],
      hex: "#f2f8ed",
    },
    "tertiary-vivid-100": {
      colorSpace: "srgb",
      components: [0.89804, 0.94118, 0.8549],
      hex: "#e5f0da",
    },
    "tertiary-vivid-200": {
      colorSpace: "srgb",
      components: [0.81176, 0.88235, 0.72941],
      hex: "#cfe1ba",
    },
    "tertiary-vivid-300": {
      colorSpace: "srgb",
      components: [0.70196, 0.8, 0.58039],
      hex: "#b3cc94",
    },
    "tertiary-vivid-400": {
      colorSpace: "srgb",
      components: [0.59216, 0.7098, 0.44706],
      hex: "#97b572",
    },
    "tertiary-vivid-500": {
      colorSpace: "srgb",
      components: [0.49412, 0.61569, 0.34118],
      hex: "#7e9d57",
    },
    "tertiary-vivid-600": {
      colorSpace: "srgb",
      components: [0.40784, 0.51765, 0.25882],
      hex: "#688442",
    },
    "tertiary-vivid-700": {
      colorSpace: "srgb",
      components: [0.32157, 0.41569, 0.19216],
      hex: "#526a31",
    },
    "tertiary-vivid-800": {
      colorSpace: "srgb",
      components: [0.24706, 0.32549, 0.13725],
      hex: "#3f5323",
    },
    "tertiary-vivid-900": {
      colorSpace: "srgb",
      components: [0.17255, 0.23137, 0.0902],
      hex: "#2c3b17",
    },
    "tertiary-vivid-950": {
      colorSpace: "srgb",
      components: [0.12157, 0.16863, 0.05098],
      hex: "#1f2b0d",
    },
    "error-50": {
      colorSpace: "srgb",
      components: [0.99608, 0.95294, 0.94902],
      hex: "#fef3f2",
    },
    "error-100": {
      colorSpace: "srgb",
      components: [1.0, 0.89804, 0.88627],
      hex: "#ffe5e2",
    },
    "error-200": {
      colorSpace: "srgb",
      components: [0.99216, 0.79608, 0.77647],
      hex: "#fdcbc6",
    },
    "error-300": {
      colorSpace: "srgb",
      components: [0.99608, 0.6549, 0.62353],
      hex: "#fea79f",
    },
    "error-400": {
      colorSpace: "srgb",
      components: [0.96471, 0.5098, 0.48235],
      hex: "#f6827b",
    },
    "error-500": {
      colorSpace: "srgb",
      components: [0.86667, 0.40392, 0.38039],
      hex: "#dd6761",
    },
    "error-600": {
      colorSpace: "srgb",
      components: [0.74902, 0.31373, 0.29804],
      hex: "#bf504c",
    },
    "error-700": {
      colorSpace: "srgb",
      components: [0.61569, 0.23922, 0.22745],
      hex: "#9d3d3a",
    },
    "error-800": {
      colorSpace: "srgb",
      components: [0.48627, 0.17647, 0.16863],
      hex: "#7c2d2b",
    },
    "error-900": {
      colorSpace: "srgb",
      components: [0.35686, 0.11765, 0.1098],
      hex: "#5b1e1c",
    },
    "error-950": {
      colorSpace: "srgb",
      components: [0.26667, 0.07451, 0.07059],
      hex: "#441312",
    },
    "error-muted-50": {
      colorSpace: "srgb",
      components: [0.99216, 0.95294, 0.94902],
      hex: "#fdf3f2",
    },
    "error-muted-100": {
      colorSpace: "srgb",
      components: [0.97255, 0.90588, 0.89804],
      hex: "#f8e7e5",
    },
    "error-muted-200": {
      colorSpace: "srgb",
      components: [0.93725, 0.81961, 0.80784],
      hex: "#efd1ce",
    },
    "error-muted-300": {
      colorSpace: "srgb",
      components: [0.87843, 0.71373, 0.69804],
      hex: "#e0b6b2",
    },
    "error-muted-400": {
      colorSpace: "srgb",
      components: [0.80392, 0.60784, 0.58824],
      hex: "#cd9b96",
    },
    "error-muted-500": {
      colorSpace: "srgb",
      components: [0.70588, 0.5098, 0.4902],
      hex: "#b4827d",
    },
    "error-muted-600": {
      colorSpace: "srgb",
      components: [0.60392, 0.41961, 0.40392],
      hex: "#9a6b67",
    },
    "error-muted-700": {
      colorSpace: "srgb",
      components: [0.4902, 0.33333, 0.31765],
      hex: "#7d5551",
    },
    "error-muted-800": {
      colorSpace: "srgb",
      components: [0.38431, 0.2549, 0.24314],
      hex: "#62413e",
    },
    "error-muted-900": {
      colorSpace: "srgb",
      components: [0.27843, 0.18039, 0.17255],
      hex: "#472e2c",
    },
    "error-muted-950": {
      colorSpace: "srgb",
      components: [0.20392, 0.12549, 0.11765],
      hex: "#34201e",
    },
    "error-vivid-50": {
      colorSpace: "srgb",
      components: [0.99216, 0.95294, 0.94902],
      hex: "#fdf3f2",
    },
    "error-vivid-100": {
      colorSpace: "srgb",
      components: [0.99608, 0.89804, 0.88627],
      hex: "#fee5e2",
    },
    "error-vivid-200": {
      colorSpace: "srgb",
      components: [0.99608, 0.79608, 0.77647],
      hex: "#fecbc6",
    },
    "error-vivid-300": {
      colorSpace: "srgb",
      components: [1.0, 0.65098, 0.62353],
      hex: "#ffa69f",
    },
    "error-vivid-400": {
      colorSpace: "srgb",
      components: [1.0, 0.48235, 0.4549],
      hex: "#ff7b74",
    },
    "error-vivid-500": {
      colorSpace: "srgb",
      components: [0.97255, 0.27843, 0.28235],
      hex: "#f84748",
    },
    "error-vivid-600": {
      colorSpace: "srgb",
      components: [0.84314, 0.18039, 0.20392],
      hex: "#d72e34",
    },
    "error-vivid-700": {
      colorSpace: "srgb",
      components: [0.69804, 0.1098, 0.14118],
      hex: "#b21c24",
    },
    "error-vivid-800": {
      colorSpace: "srgb",
      components: [0.55294, 0.05882, 0.09412],
      hex: "#8d0f18",
    },
    "error-vivid-900": {
      colorSpace: "srgb",
      components: [0.40784, 0.02353, 0.0549],
      hex: "#68060e",
    },
    "error-vivid-950": {
      colorSpace: "srgb",
      components: [0.30588, 0.00392, 0.02745],
      hex: "#4e0107",
    },
    "success-50": {
      colorSpace: "srgb",
      components: [0.93725, 0.97647, 0.94118],
      hex: "#eff9f0",
    },
    "success-100": {
      colorSpace: "srgb",
      components: [0.87059, 0.94902, 0.87843],
      hex: "#def2e0",
    },
    "success-200": {
      colorSpace: "srgb",
      components: [0.75686, 0.89412, 0.76863],
      hex: "#c1e4c4",
    },
    "success-300": {
      colorSpace: "srgb",
      components: [0.61961, 0.81961, 0.64314],
      hex: "#9ed1a4",
    },
    "success-400": {
      colorSpace: "srgb",
      components: [0.4902, 0.73333, 0.52157],
      hex: "#7dbb85",
    },
    "success-500": {
      colorSpace: "srgb",
      components: [0.38039, 0.63529, 0.42353],
      hex: "#61a26c",
    },
    "success-600": {
      colorSpace: "srgb",
      components: [0.29804, 0.53725, 0.33725],
      hex: "#4c8956",
    },
    "success-700": {
      colorSpace: "srgb",
      components: [0.22745, 0.43529, 0.26275],
      hex: "#3a6f43",
    },
    "success-800": {
      colorSpace: "srgb",
      components: [0.16471, 0.33725, 0.19608],
      hex: "#2a5632",
    },
    "success-900": {
      colorSpace: "srgb",
      components: [0.1098, 0.24314, 0.13333],
      hex: "#1c3e22",
    },
    "success-950": {
      colorSpace: "srgb",
      components: [0.07059, 0.17647, 0.0902],
      hex: "#122d17",
    },
    "success-muted-50": {
      colorSpace: "srgb",
      components: [0.95294, 0.96863, 0.95294],
      hex: "#f3f7f3",
    },
    "success-muted-100": {
      colorSpace: "srgb",
      components: [0.90196, 0.93333, 0.90588],
      hex: "#e6eee7",
    },
    "success-muted-200": {
      colorSpace: "srgb",
      components: [0.81176, 0.87059, 0.81569],
      hex: "#cfded0",
    },
    "success-muted-300": {
      colorSpace: "srgb",
      components: [0.70196, 0.78431, 0.7098],
      hex: "#b3c8b5",
    },
    "success-muted-400": {
      colorSpace: "srgb",
      components: [0.59608, 0.69412, 0.60784],
      hex: "#98b19b",
    },
    "success-muted-500": {
      colorSpace: "srgb",
      components: [0.49804, 0.6, 0.5098],
      hex: "#7f9982",
    },
    "success-muted-600": {
      colorSpace: "srgb",
      components: [0.40784, 0.50196, 0.41961],
      hex: "#68806b",
    },
    "success-muted-700": {
      colorSpace: "srgb",
      components: [0.32549, 0.40392, 0.33333],
      hex: "#536755",
    },
    "success-muted-800": {
      colorSpace: "srgb",
      components: [0.24706, 0.31373, 0.2549],
      hex: "#3f5041",
    },
    "success-muted-900": {
      colorSpace: "srgb",
      components: [0.17255, 0.22353, 0.18039],
      hex: "#2c392e",
    },
    "success-muted-950": {
      colorSpace: "srgb",
      components: [0.12157, 0.16078, 0.12549],
      hex: "#1f2920",
    },
    "success-vivid-50": {
      colorSpace: "srgb",
      components: [0.92549, 0.98431, 0.92941],
      hex: "#ecfbed",
    },
    "success-vivid-100": {
      colorSpace: "srgb",
      components: [0.84706, 0.95686, 0.85882],
      hex: "#d8f4db",
    },
    "success-vivid-200": {
      colorSpace: "srgb",
      components: [0.71373, 0.9098, 0.73725],
      hex: "#b6e8bc",
    },
    "success-vivid-300": {
      colorSpace: "srgb",
      components: [0.54902, 0.83922, 0.59216],
      hex: "#8cd697",
    },
    "success-vivid-400": {
      colorSpace: "srgb",
      components: [0.39216, 0.75686, 0.45882],
      hex: "#64c175",
    },
    "success-vivid-500": {
      colorSpace: "srgb",
      components: [0.26275, 0.66275, 0.34902],
      hex: "#43a959",
    },
    "success-vivid-600": {
      colorSpace: "srgb",
      components: [0.17255, 0.56078, 0.26667],
      hex: "#2c8f44",
    },
    "success-vivid-700": {
      colorSpace: "srgb",
      components: [0.10588, 0.4549, 0.2],
      hex: "#1b7433",
    },
    "success-vivid-800": {
      colorSpace: "srgb",
      components: [0.05882, 0.35294, 0.1451],
      hex: "#0f5a25",
    },
    "success-vivid-900": {
      colorSpace: "srgb",
      components: [0.02745, 0.2549, 0.09412],
      hex: "#074118",
    },
    "success-vivid-950": {
      colorSpace: "srgb",
      components: [0.00784, 0.18431, 0.05882],
      hex: "#022f0f",
    },
    "warning-50": {
      colorSpace: "srgb",
      components: [0.99608, 0.95294, 0.9451],
      hex: "#fef3f1",
    },
    "warning-100": {
      colorSpace: "srgb",
      components: [0.99216, 0.89804, 0.88235],
      hex: "#fde5e1",
    },
    "warning-200": {
      colorSpace: "srgb",
      components: [0.99216, 0.8, 0.76471],
      hex: "#fdccc3",
    },
    "warning-300": {
      colorSpace: "srgb",
      components: [0.98824, 0.66275, 0.60784],
      hex: "#fca99b",
    },
    "warning-400": {
      colorSpace: "srgb",
      components: [0.92941, 0.54118, 0.47843],
      hex: "#ed8a7a",
    },
    "warning-500": {
      colorSpace: "srgb",
      components: [0.83137, 0.43529, 0.37647],
      hex: "#d46f60",
    },
    "warning-600": {
      colorSpace: "srgb",
      components: [0.71765, 0.34902, 0.29412],
      hex: "#b7594b",
    },
    "warning-700": {
      colorSpace: "srgb",
      components: [0.58824, 0.27059, 0.22353],
      hex: "#964539",
    },
    "warning-800": {
      colorSpace: "srgb",
      components: [0.46275, 0.2, 0.16471],
      hex: "#76332a",
    },
    "warning-900": {
      colorSpace: "srgb",
      components: [0.34118, 0.13725, 0.1098],
      hex: "#57231c",
    },
    "warning-950": {
      colorSpace: "srgb",
      components: [0.25098, 0.0902, 0.07059],
      hex: "#401712",
    },
    "warning-muted-50": {
      colorSpace: "srgb",
      components: [0.98824, 0.95686, 0.94902],
      hex: "#fcf4f2",
    },
    "warning-muted-100": {
      colorSpace: "srgb",
      components: [0.96471, 0.9098, 0.89804],
      hex: "#f6e8e5",
    },
    "warning-muted-200": {
      colorSpace: "srgb",
      components: [0.92549, 0.82353, 0.80784],
      hex: "#ecd2ce",
    },
    "warning-muted-300": {
      colorSpace: "srgb",
      components: [0.86275, 0.72157, 0.69412],
      hex: "#dcb8b1",
    },
    "warning-muted-400": {
      colorSpace: "srgb",
      components: [0.78431, 0.61961, 0.58824],
      hex: "#c89e96",
    },
    "warning-muted-500": {
      colorSpace: "srgb",
      components: [0.6902, 0.52157, 0.4902],
      hex: "#b0857d",
    },
    "warning-muted-600": {
      colorSpace: "srgb",
      components: [0.58431, 0.43137, 0.40392],
      hex: "#956e67",
    },
    "warning-muted-700": {
      colorSpace: "srgb",
      components: [0.47843, 0.34118, 0.31765],
      hex: "#7a5751",
    },
    "warning-muted-800": {
      colorSpace: "srgb",
      components: [0.37255, 0.26275, 0.24314],
      hex: "#5f433e",
    },
    "warning-muted-900": {
      colorSpace: "srgb",
      components: [0.27059, 0.18431, 0.16863],
      hex: "#452f2b",
    },
    "warning-muted-950": {
      colorSpace: "srgb",
      components: [0.19608, 0.12941, 0.11765],
      hex: "#32211e",
    },
    "warning-vivid-50": {
      colorSpace: "srgb",
      components: [1.0, 0.95294, 0.94118],
      hex: "#fff3f0",
    },
    "warning-vivid-100": {
      colorSpace: "srgb",
      components: [0.99216, 0.89804, 0.88235],
      hex: "#fde5e1",
    },
    "warning-vivid-200": {
      colorSpace: "srgb",
      components: [0.99608, 0.79608, 0.76078],
      hex: "#fecbc2",
    },
    "warning-vivid-300": {
      colorSpace: "srgb",
      components: [0.99608, 0.65882, 0.60392],
      hex: "#fea89a",
    },
    "warning-vivid-400": {
      colorSpace: "srgb",
      components: [1.0, 0.48627, 0.41176],
      hex: "#ff7c69",
    },
    "warning-vivid-500": {
      colorSpace: "srgb",
      components: [0.92549, 0.34902, 0.27843],
      hex: "#ec5947",
    },
    "warning-vivid-600": {
      colorSpace: "srgb",
      components: [0.8, 0.25882, 0.19608],
      hex: "#cc4232",
    },
    "warning-vivid-700": {
      colorSpace: "srgb",
      components: [0.65882, 0.18824, 0.13725],
      hex: "#a83023",
    },
    "warning-vivid-800": {
      colorSpace: "srgb",
      components: [0.52157, 0.13333, 0.0902],
      hex: "#852217",
    },
    "warning-vivid-900": {
      colorSpace: "srgb",
      components: [0.38431, 0.08235, 0.05098],
      hex: "#62150d",
    },
    "warning-vivid-950": {
      colorSpace: "srgb",
      components: [0.28627, 0.04706, 0.02353],
      hex: "#490c06",
    },
    "neutral-50": {
      colorSpace: "srgb",
      components: [0.96863, 0.96078, 0.95686],
      hex: "#f7f5f4",
    },
    "neutral-100": {
      colorSpace: "srgb",
      components: [0.92941, 0.92157, 0.91373],
      hex: "#edebe9",
    },
    "neutral-200": {
      colorSpace: "srgb",
      components: [0.86275, 0.84706, 0.83137],
      hex: "#dcd8d4",
    },
    "neutral-300": {
      colorSpace: "srgb",
      components: [0.77647, 0.75294, 0.73333],
      hex: "#c6c0bb",
    },
    "neutral-400": {
      colorSpace: "srgb",
      components: [0.68235, 0.65882, 0.63137],
      hex: "#aea8a1",
    },
    "neutral-500": {
      colorSpace: "srgb",
      components: [0.58824, 0.56078, 0.53333],
      hex: "#968f88",
    },
    "neutral-600": {
      colorSpace: "srgb",
      components: [0.49412, 0.47059, 0.44314],
      hex: "#7e7871",
    },
    "neutral-700": {
      colorSpace: "srgb",
      components: [0.39608, 0.37647, 0.35294],
      hex: "#65605a",
    },
    "neutral-800": {
      colorSpace: "srgb",
      components: [0.30588, 0.2902, 0.27059],
      hex: "#4e4a45",
    },
    "neutral-900": {
      colorSpace: "srgb",
      components: [0.21961, 0.20784, 0.19216],
      hex: "#383531",
    },
    "neutral-950": {
      colorSpace: "srgb",
      components: [0.15686, 0.1451, 0.13725],
      hex: "#282523",
    },
    "neutral-variant-50": {
      colorSpace: "srgb",
      components: [0.97255, 0.96078, 0.95294],
      hex: "#f8f5f3",
    },
    "neutral-variant-100": {
      colorSpace: "srgb",
      components: [0.94118, 0.91765, 0.90588],
      hex: "#f0eae7",
    },
    "neutral-variant-200": {
      colorSpace: "srgb",
      components: [0.87843, 0.84314, 0.81961],
      hex: "#e0d7d1",
    },
    "neutral-variant-300": {
      colorSpace: "srgb",
      components: [0.8, 0.7451, 0.71765],
      hex: "#ccbeb7",
    },
    "neutral-variant-400": {
      colorSpace: "srgb",
      components: [0.71373, 0.65098, 0.61176],
      hex: "#b6a69c",
    },
    "neutral-variant-500": {
      colorSpace: "srgb",
      components: [0.61569, 0.55294, 0.51765],
      hex: "#9d8d84",
    },
    "neutral-variant-600": {
      colorSpace: "srgb",
      components: [0.51765, 0.45882, 0.42745],
      hex: "#84756d",
    },
    "neutral-variant-700": {
      colorSpace: "srgb",
      components: [0.41961, 0.36863, 0.33725],
      hex: "#6b5e56",
    },
    "neutral-variant-800": {
      colorSpace: "srgb",
      components: [0.32549, 0.28235, 0.25882],
      hex: "#534842",
    },
    "neutral-variant-900": {
      colorSpace: "srgb",
      components: [0.23529, 0.2, 0.18431],
      hex: "#3c332f",
    },
    "neutral-variant-950": {
      colorSpace: "srgb",
      components: [0.16863, 0.14118, 0.12941],
      hex: "#2b2421",
    },
    },
  }),
  input: {
    text: "md",
    color: "light",
    depth: "default",
    motion: "default",
    radius: "default",
    density: "default",
    contrast: "default",
    vibrancy: "balanced",
  },
});

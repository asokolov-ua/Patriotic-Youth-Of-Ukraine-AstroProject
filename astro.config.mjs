import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://pmu.org.ua",

  vite: {
    plugins: [tailwindcss()],
  },
});
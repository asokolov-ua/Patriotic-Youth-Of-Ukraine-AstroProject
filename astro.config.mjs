import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://asokolov-ua.github.io",
  base: "/Patriotic-Youth-Of-Ukraine-AstroProject",

  vite: {
    plugins: [tailwindcss()],
  },
});
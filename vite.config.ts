import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp fmt",
  },
  fmt: {},
});

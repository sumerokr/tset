import { createApp } from "vue";
import App from "./App.vue";

if (process.env.NODE_ENV === "development") {
  const { worker } = await import("./mocks/browser");
  worker.start();
}

import "./assets/main.css";

createApp(App).mount("#app");

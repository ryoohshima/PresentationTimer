import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";

const rootElement = document.getElementById("root");
if (rootElement === null) {
  throw new Error("ルート要素 #root が見つからぬ");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

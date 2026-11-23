import { createRoot } from "react-dom/client";
import { Scene } from "./Scene";
import "./frame.css";

createRoot(document.getElementById("root")!).render(
  <main aria-label="Naimish Kanpara portfolio" onLoadCapture={event => {
    if (event.target instanceof HTMLIFrameElement) {
      event.target.title = "Naimish Kanpara — Video Editor";
      event.target.allowFullscreen = true;
    }
  }}>
    <Scene />
  </main>
);

import { createRoot } from "react-dom/client";
import { StaticApp } from "./static-app";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing root element");
}

createRoot(root).render(<StaticApp />);

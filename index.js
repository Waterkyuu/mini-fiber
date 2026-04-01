import { render } from "./package/react/src/fiber.js";
import App from "./App.compiled.js";

const root = document.getElementById("root");

render(App(), root);

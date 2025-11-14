import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { mx_worley_distance } from "three/src/nodes/materialx/lib/mx_noise.js";

const root = createRoot(document.getElementById("root"));
root.render(<App />);



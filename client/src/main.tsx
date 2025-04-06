import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Append meta tags for styling
const head = document.head;

// Add font links
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap";
head.appendChild(fontLink);

// Add Remix icon for icons
const iconLink = document.createElement("link");
iconLink.rel = "stylesheet";
iconLink.href = "https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css";
head.appendChild(iconLink);

// Add title
const title = document.createElement("title");
title.textContent = "Azure Haven Hotel & Spa";
head.appendChild(title);

createRoot(document.getElementById("root")!).render(<App />);

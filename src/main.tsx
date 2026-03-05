
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import "./services/simpleApi"; // Import for testing - adds window.testAPI

  createRoot(document.getElementById("root")!).render(<App />);
  
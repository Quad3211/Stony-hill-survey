import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

// Check for critical environment variables before loading the app
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

if (!apiKey || apiKey === "your-api-key-here") {
  document.getElementById("root")!.innerHTML = `
    <div style="font-family: system-ui, sans-serif; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #f9fafb; padding: 20px; text-align: center;">
      <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); max-width: 500px; width: 100%;">
        <div style="color: #dc2626; margin-bottom: 20px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 12px;">Configuration Error</h1>
        <p style="color: #4b5563; margin-bottom: 24px; line-height: 1.5;">
          The application cannot start because the Firebase API Key is missing.
        </p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: left; margin-bottom: 24px; font-size: 14px; color: #374151;">
          <p style="margin-bottom: 8px; font-weight: 600;">To fix this in Vercel:</p>
          <ol style="margin-left: 20px; list-style-type: decimal; margin-bottom: 0;">
            <li style="margin-bottom: 4px;">Go to <strong>Settings > Environment Variables</strong></li>
            <li style="margin-bottom: 4px;">Add <code>VITE_FIREBASE_API_KEY</code> from your .env.local</li>
            <li style="margin-bottom: 4px;">Add other required variables</li>
            <li style="font-weight: 600;">Redeploy the application</li>
          </ol>
        </div>
        <button onclick="window.location.reload()" style="background-color: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 500; cursor: pointer; transition: background-color 0.2s;">
          Reload Page
        </button>
      </div>
    </div>
  `;
} else {
  // Dynamically import App to prevent it from loading/crashing if config is missing
  import("./App.tsx").then(({ default: App }) => {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
  });
}

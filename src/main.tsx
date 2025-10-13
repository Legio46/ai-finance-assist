import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LanguageProvider } from './contexts/LanguageContext'

// Set dark mode as default
if (!localStorage.getItem("theme")) {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);

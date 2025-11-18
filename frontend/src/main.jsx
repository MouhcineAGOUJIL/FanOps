import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { loadTestData } from './testData/loadTestData'

const rootElement = document.getElementById('root');

async function bootstrap() {
  if (!rootElement) {
    document.body.innerHTML =
      '<div style="padding: 20px; background: red; color: white;"><h1>ERROR: Root element not found!</h1></div>';
    return;
  }

  await loadTestData();

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}

bootstrap();

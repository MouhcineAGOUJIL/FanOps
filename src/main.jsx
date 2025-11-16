import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/common/ErrorBoundary'

// Test if React is rendering
console.log('🚀 React app starting...');
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; background: red; color: white;"><h1>ERROR: Root element not found!</h1></div>';
} else {
  try {
    console.log('✅ Root element found, creating root...');
    const root = createRoot(rootElement);
    console.log('✅ Root created');
    
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
    console.log('✅ App rendered');
  } catch (error) {
    console.error('❌ Error rendering app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; background: red; color: white; font-family: monospace;">
        <h1>Fatal Error</h1>
        <p><strong>Message:</strong> ${error.message}</p>
        <pre style="background: black; padding: 10px; overflow: auto;">${error.stack}</pre>
      </div>
    `;
  }
}

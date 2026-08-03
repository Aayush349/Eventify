import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './app/store';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9375rem',
              fontWeight: 500,
              borderRadius: '0.75rem',
              padding: '0.875rem 1.25rem',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: 'white' },
              style: {
                background: '#f0fdf4',
                color: '#065f46',
                border: '1px solid #a7f3d0',
              },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: 'white' },
              style: {
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
              },
            },
            loading: {
              style: {
                background: '#f0f9ff',
                color: '#0c4a6e',
                border: '1px solid #bae6fd',
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { PublisherAuthProvider, AdminAuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PublisherAuthProvider>
        <AdminAuthProvider>
          <App />
        </AdminAuthProvider>
      </PublisherAuthProvider>
    </BrowserRouter>
  </StrictMode>
);

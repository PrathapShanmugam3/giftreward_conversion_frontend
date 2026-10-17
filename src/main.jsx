import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { PublisherAuthProvider, AdminAuthProvider } from './context/AuthContext.jsx';
import { SiteProvider } from './context/SiteContext.jsx';
import { FeedbackProvider } from './components/ui';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SiteProvider>
        <FeedbackProvider>
          <PublisherAuthProvider>
            <AdminAuthProvider>
              <App />
            </AdminAuthProvider>
          </PublisherAuthProvider>
        </FeedbackProvider>
      </SiteProvider>
    </BrowserRouter>
  </StrictMode>
);

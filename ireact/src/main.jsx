import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './css/styles.css'
import App from './App.jsx'
import axios from 'axios';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;
axios.get('http://localhost:8000/idjango/api/csrf/').catch(() => console.warn('Could not fetch CSRF token'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

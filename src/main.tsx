/* 
 * Project: Campus Smart Ride
 * Author: [Nachaal]
 * Description: Frontend routing and main application wrapper.
 */


import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

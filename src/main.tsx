import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { bootstrap } from '@/app/bootstrap';
import '@/styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

async function start(container: HTMLElement) {
  await bootstrap();

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void start(rootElement);

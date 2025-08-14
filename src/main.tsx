// main.tsx
import { Buffer } from 'buffer';
import process from 'process';

// Полифиллы для глобальных переменных
window.Buffer = Buffer;
window.process = process;

import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SolanaProvider } from './providers/SolanaProvider';
import { clusterApiUrl } from '@solana/web3.js';

const Root: React.FC = () => {
  const [rpcUrl, setRpcUrl] = React.useState<string>(clusterApiUrl("devnet"));

  return (
    <React.StrictMode>
      <SolanaProvider rpcUrl={rpcUrl}>
        <App setRpcUrl={setRpcUrl} rpcUrl={rpcUrl}/>
      </SolanaProvider>
    </React.StrictMode>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<Root />);
} else {
  console.error('Root element not found');
}
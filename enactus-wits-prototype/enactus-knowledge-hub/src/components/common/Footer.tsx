import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div>
          <strong>Enactus University of the Witwatersrand</strong> — Knowledge Hub & AI Learning Repository
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Standalone Knowledge Domain</span>
          <span>|</span>
          <a
            href={import.meta.env.VITE_MAIN_APP_URL || "http://localhost:3001"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            Main Enactus Support System <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';

export default function Datenschutz() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose max-w-none">
        <iframe 
          src="/datenschutz.pdf" 
          className="w-full h-screen"
          title="Datenschutzerklärung"
        />
      </div>
    </div>
  );
}
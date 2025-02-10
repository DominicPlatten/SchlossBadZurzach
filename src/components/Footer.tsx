import React, { useState } from 'react';
import { getPdfUrl } from '../lib/firebase-admin';

export default function Footer() {
  const [loading, setLoading] = useState(false);

  const handlePdfClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const pdfUrl = await getPdfUrl('datenschutz.pdf');
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error opening PDF:', error);
      alert('Datei konnte nicht geöffnet werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-100 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Öffnungszeiten</h3>
            <p className="text-gray-600">
              Park: Täglich 10.00 Uhr – Dämmerung<br />
              Schloss: Nur bei speziellen Anlässen geöffnet
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Kontaktdaten</h3>
            <p className="text-gray-600">
              <a href="mailto:info@parkhimmelrych.ch" className="hover:text-indigo-600">
                info@parkhimmelrych.ch
              </a>
            </p>
            <div className="mt-4">
              <h4 className="font-medium text-gray-900">Inhaber</h4>
              <p className="text-gray-600">
                Park Himmelrych AG<br />
                Barzstrasse 2<br />
                5330 Bad Zurzach
              </p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-gray-900">Ansprechpartner</h4>
              <p className="text-gray-600">Reto S. Fuchs</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Rechtliches</h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                <a 
                  href="#" 
                  onClick={handlePdfClick}
                  className="hover:text-indigo-600 cursor-pointer"
                >
                  {loading ? 'Wird geladen...' : 'Datenschutzerklärung'}
                </a>
              </li>
              <li>
                <p>Copyright: Das Copyright für den gesamten Inhalt liegt bei Park Himmelrych AG</p>
              </li>
            </ul>
            <div className="mt-4">
              <h4 className="font-medium text-gray-900">Konzept & Realisation</h4>
              <p className="text-gray-600">
                Dominic Platten<br />
                Hofäckerstrasse 2<br />
                5300 Turgi<br />
                <a href="mailto:dominic.platten@gmail.com" className="hover:text-indigo-600">
                  dominic.platten@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
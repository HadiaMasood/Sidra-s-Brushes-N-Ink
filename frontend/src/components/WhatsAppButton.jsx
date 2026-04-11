import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { whatsappService } from '../services/whatsappService';

export const WhatsAppButton = () => {
  const config = useSelector(state => state.config);
  const whatsappNumber = config.contact?.contact_phone?.replace(/\D/g, '') || '923275693892';
  const [showMenu, setShowMenu] = useState(false);

  const handleInquiry = () => {
    const message = 'Hi! I have a question about your artworks. Can you help me?';
    whatsappService.openWhatsApp(whatsappNumber, message);
  };

  const handleSupport = () => {
    const message = 'Hi! I need support with my order or have a question. Can you assist?';
    whatsappService.openWhatsApp(whatsappNumber, message);
  };

  return (
    <>
      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Menu Items */}
        {showMenu && (
          <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={handleInquiry}
              className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b"
            >
              <span className="font-semibold text-gray-800">📝 General Inquiry</span>
              <p className="text-xs text-gray-600">Ask about products</p>
            </button>
            <button
              onClick={handleSupport}
              className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition"
            >
              <span className="font-semibold text-gray-800">🆘 Support</span>
              <p className="text-xs text-gray-600">Order issues or help</p>
            </button>
          </div>
        )}

        {/* Main WhatsApp Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition transform hover:scale-110 flex items-center justify-center"
          title="Chat on WhatsApp"
        >
          <FaWhatsapp size={24} />
        </button>
      </div>

      {/* Backdrop when menu is open */}
      {showMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
};

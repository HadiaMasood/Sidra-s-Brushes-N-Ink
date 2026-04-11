import React, { useState, useEffect } from 'react';
import { FaFacebook, FaInstagram, FaWhatsapp, FaTiktok } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import { useSiteConfig } from '../hooks/useSiteConfig';

export const Footer = () => {
  const [refresh, setRefresh] = useState(0);
  const { branding, contact, social } = useSiteConfig();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const handleUpdate = () => setRefresh(prev => prev + 1);
    window.addEventListener('configUpdated', handleUpdate);
    return () => window.removeEventListener('configUpdated', handleUpdate);
  }, []);

  // Get URLs with fallback to "#"
  const facebookUrl = social?.facebook_url || '#';
  const instagramUrl = social?.instagram_url || '#';
  const tiktokUrl = social?.tiktok_url || '#';
  const whatsappNumber = contact?.contact_phone?.replace(/\D/g, '') || '923275693892';

  return (
    <footer className="footer" id="main-site-footer">
      <div className="footer-container">
        {/* Column 1: About + Social */}
        <div className="footer-column">
          <h3 className="footer-title">{branding?.brand_name || "Sidra's Brushes N Ink"}</h3>
          <p className="footer-description">
            {branding?.brand_tagline || 'Premium handcrafted artworks.'}
          </p>
          <div className="footer-social">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="social-icon instagram" title="Instagram">
              <FaInstagram />
            </a>
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="social-icon facebook" title="Facebook">
              <FaFacebook />
            </a>
            <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="social-icon tiktok" title="TikTok">
              <FaTiktok />
            </a>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="social-icon whatsapp" title="WhatsApp">
              <FaWhatsapp />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-column">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/custom-order">Custom Order</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div className="footer-column">
          <h3 className="footer-title">Contact</h3>
          <p className="footer-description">{contact?.contact_address || 'Pakistan'}</p>
          <p className="footer-description">{contact?.contact_phone || '03275693892'}</p>
          <p className="footer-description">{contact?.contact_email || 'info@example.com'}</p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <p className="copyright">
          &copy; {currentYear} {branding?.brand_name || "Sidra's Brushes N Ink"}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

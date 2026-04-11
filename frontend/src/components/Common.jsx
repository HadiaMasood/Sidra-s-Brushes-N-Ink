import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaFacebook, FaInstagram, FaWhatsapp, FaTwitter, FaPinterest, FaMapMarkerAlt, FaPhone, FaEnvelope, FaTiktok } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { setFullConfig } from '../store/configSlice';
import { configService } from '../services/api';
import { getArtworkImageUrl } from '../utils/imageUtils';
import { ArtworkImage } from './OptimizedImage';

export const ArtworkCard = ({ artwork, onAddToCart, onWishlistToggle, isInWishlist, onQuickView }) => {
  const handleAddClick = (e) => {
    e.stopPropagation();
    // Open quick view
    if (onQuickView) {
      onQuickView(artwork);
    }
  };

  return (
    <article
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group cursor-pointer"
      onClick={() => onQuickView?.(artwork)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onQuickView?.(artwork);
        }
      }}
      aria-label={`View details for ${artwork.title}`}
    >
      <div className="relative h-64 bg-white overflow-hidden p-2 flex items-center justify-center">
        <ArtworkImage 
          artwork={artwork} 
          className="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-300"
        />

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
          <span className="bg-white text-ink-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
            👁️ Quick View
          </span>
        </div>

        {isInWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWishlistToggle?.(artwork);
            }}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow z-10"
            aria-label="Remove from wishlist"
          >
            ♥
          </button>
        )}
      </div>
      <div className="p-4 bg-paper-100">
        <h3 className="text-xl font-heading font-bold text-ink-900 mb-1">{artwork.title}</h3>
        <p className="text-ink-600 text-sm font-subheading italic line-clamp-2">{artwork.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-heading font-bold text-ink-800" aria-label={`Price: ${(Number(artwork.price) || 0).toFixed(2)} Rupees`}>
            Rs. {(Number(artwork.price) || 0).toFixed(2)}
          </span>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 rounded-sm font-body font-semibold transition bg-rose-200 text-ink-900 hover:bg-rose-300 z-10"
            aria-label={`Add ${artwork.title} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
};

export const Hero = React.memo(() => {
  const navigate = useNavigate();
  const config = useSelector(state => state.config);

  const siteName = config.branding?.brand_name || "Sidra's Brushes N Ink";
  const tagline = config.branding?.brand_tagline || 'Authentic Art, Beautiful Expression';

  return (
    <div className="w-full">
      <Helmet>
        <title>{siteName} - Traditional Ink & Brushes</title>
        <meta name="description" content="Discover beautiful handcrafted ink and calligraphy artworks. Authentic traditional pieces for your collection." />
      </Helmet>

      {/* Rose Header Section - Same as Blog/About */}
      <div className="bg-rose-200 w-full">
        {/* Hero Image - Wide */}
        <div className="relative w-full overflow-hidden flex justify-center items-center" style={{
          minHeight: '400px',
          maxHeight: '600px'
        }}>
          <img
            src="/sidras-brushes-ink-islamic-calligraphy-hero.png"
            alt="Sidra's Brushes N Ink - Premium Handmade Islamic Calligraphy and Nature-Inspired Art"
            className="w-full h-auto object-contain"
            style={{ maxHeight: '600px' }}
            loading="eager"
            decoding="async"
            width="1920"
            height="600"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />

          {/* Text Overlay - Inside image container */}
          <div className="absolute inset-0 flex flex-col items-center justify-end text-center z-10 px-8 pb-4 md:pb-8">
            {/* Only show button and minimal text since image has text */}
            <div className="animate-fade-in-up">
              <button
                onClick={() => navigate('/gallery')}
                className="px-10 py-4 bg-ink-900 text-white font-body font-medium tracking-widest text-lg hover:bg-gold-calligraphy hover:text-white transition-all duration-500 shadow-xl rounded-sm opacity-90 hover:opacity-100"
              >
                EXPLORE COLLECTION
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Hero.displayName = 'Hero';

export const Header = React.memo(({ cartCount, wishlistCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const config = useSelector(state => state.config);

  const siteName = config.branding?.brand_name || "Sidra's Brushes N Ink";
  const logoPath = config.branding?.site_logo;

  let logoUrl = "/sidra-inkbox-brushes-logo.jpeg";
  if (logoPath) {
    if (logoPath.startsWith('data:image')) {
      logoUrl = logoPath;
    } else if (logoPath.startsWith('http')) {
      logoUrl = logoPath;
    } else {
      // Normalize VITE_API_URL: remove trailing /api if present so storage path resolves correctly
      const rawApi = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const backendBase = String(rawApi).replace(/\/api\/?$/i, '').replace(/\/$/, '');
      logoUrl = `${backendBase}/storage/${logoPath}`;
    }
  }

  return (
    <header className="bg-black shadow-lg sticky top-0 z-50 border-b-2 transition-all duration-300" style={{ borderBottomColor: '#C8A951' }}>
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold-calligraphy focus:text-black focus:rounded"
      >
        Skip to main content
      </a>
      
      <div className="w-full px-6 py-4 flex justify-between items-center">
        <a href="/" className="flex items-center gap-3 group" aria-label="Go to homepage">
          {logoUrl ? (
            <picture>
              <img
                src={logoUrl}
                alt={`${siteName} Logo`}
                className="h-12 w-12 rounded-full object-cover logo-image shadow-sm group-hover:shadow-md transition"
                loading="eager"
                decoding="async"
                width="48"
                height="48"
              />
            </picture>
          ) : (
            <div className="logo-fallback font-heading text-xl shadow-sm" aria-hidden="true">
              {String(siteName || '').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-heading font-bold site-name tracking-tight transition-colors duration-300" style={{ color: '#C8A951' }}>
            {siteName}
          </h1>
        </a>

        <nav className="hidden md:flex gap-4 lg:gap-8 items-center" role="navigation" aria-label="Main navigation">
          {['Home', 'Gallery', 'About Us', 'Blog', 'Custom Orders', 'Contact'].map((item) => (
            <a
              key={item}
              href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
              className="font-heading font-medium tracking-wide transition-colors uppercase text-sm whitespace-nowrap hover:opacity-80"
              style={{ color: '#C8A951' }}
              aria-label={`Navigate to ${item}`}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5" role="navigation" aria-label="User actions">
          <a 
            href="/wishlist" 
            className="relative text-xl transition transform hover:scale-110 duration-300 p-1 hover:opacity-80" 
            style={{ color: '#C8A951' }}
            aria-label={`Wishlist with ${wishlistCount} items`}
          >
            <span className="" aria-hidden="true">❤️</span>
            {wishlistCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 text-black rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-sm" 
                style={{ backgroundColor: '#C8A951' }}
                aria-label={`${wishlistCount} items in wishlist`}
              >
                {wishlistCount}
              </span>
            )}
          </a>
          <a 
            href="/cart" 
            className="relative text-xl transition transform hover:scale-110 duration-300 p-1 hover:opacity-80" 
            style={{ color: '#C8A951' }}
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <span className="" aria-hidden="true">🛒</span>
            {cartCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 text-black rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-sm" 
                style={{ backgroundColor: '#C8A951' }}
                aria-label={`${cartCount} items in cart`}
              >
                {cartCount}
              </span>
            )}
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-xl"
            style={{ color: '#C8A951' }}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            ☰
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden bg-black animate-slide-down" 
          style={{ borderTopColor: '#C8A951', borderTopWidth: '1px' }}
          role="navigation"
          aria-label="Mobile navigation"
        >
          {['Home', 'Gallery', 'About Us', 'Blog', 'Custom Orders', 'Contact'].map((item) => (
            <a
              key={item}
              href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
              className="block px-6 py-3 hover:bg-gray-900 transition font-body"
              style={{ color: '#C8A951' }}
              aria-label={`Navigate to ${item}`}
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </header>
  );
});

Header.displayName = 'Header';

export const Footer = () => {
  const config = useSelector(state => state.config);
  const branding = config.branding || {};
  const contact = config.contact || {};
  const social = config.social || {};

  const siteName = branding.brand_name || "Sidra's Brushes N Ink";
  const contactPhone = contact.contact_phone || '03275693892';
  const contactEmail = contact.contact_email || 'hello@sidraink.com';
  const contactAddress = contact.contact_address || 'Lahore, Pakistan';

  const socialFacebook = social.facebook_url || '';
  const socialInstagram = social.instagram_url || '';
  const socialTiktok = social.tiktok_url || '';
  const socialWhatsapp = contactPhone.replace(/\D/g, '');

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink-900 text-paper-warm pt-16 pb-8 border-t-4 border-gold-calligraphy" id="site-footer-common" role="contentinfo" aria-label="Site footer">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-3xl font-heading font-bold text-rose-200 mb-4">{siteName}</h3>
            <p className="text-gray-400 font-body text-sm leading-relaxed max-w-xs">
              Discover authentic handcrafted calligraphy and art pieces. We bring the elegance of traditional ink to your modern space.
            </p>
            <div className="pt-4">
              <span className="font-script text-2xl text-gold-calligraphy" aria-label="Tagline">Art for the Soul</span>
            </div>
          </div>

          {/* Links Column */}
          <nav aria-label="Footer navigation">
            <h3 className="text-xl font-heading font-bold text-rose-200 mb-6 relative inline-block">
              Explore
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-gold-calligraphy" aria-hidden="true"></span>
            </h3>
            <ul className="space-y-3 font-body text-sm">
              {['Gallery', 'Custom Orders', 'Blog', 'Contact'].map((link) => (
                <li key={link}>
                  <a 
                    href={`/${link.toLowerCase().replace(' ', '-')}`} 
                    className="text-gray-300 hover:text-gold-calligraphy transition duration-300 flex items-center gap-2 group"
                    aria-label={`Navigate to ${link}`}
                  >
                    <span className="w-1 h-1 bg-gold-calligraphy rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Column */}
          <address className="not-italic">
            <h3 className="text-xl font-heading font-bold text-rose-200 mb-6 relative inline-block">
              Get in Touch
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-gold-calligraphy" aria-hidden="true"></span>
            </h3>
            <div className="space-y-4 font-body text-sm">
              <div className="flex items-start gap-3 text-gray-300 group">
                <FaPhone className="text-gold-calligraphy mt-1 group-hover:text-white transition" aria-hidden="true" />
                <a href={`tel:${contactPhone.replace(/\D/g, '')}`} className="group-hover:text-white transition" aria-label={`Call us at ${contactPhone}`}>
                  {contactPhone}
                </a>
              </div>
              <div className="flex items-start gap-3 text-gray-300 group">
                <FaEnvelope className="text-gold-calligraphy mt-1 group-hover:text-white transition" aria-hidden="true" />
                <a href={`mailto:${contactEmail}`} className="group-hover:text-white transition" aria-label={`Email us at ${contactEmail}`}>
                  {contactEmail}
                </a>
              </div>
              <div className="flex items-start gap-3 text-gray-300 group">
                <FaMapMarkerAlt className="text-gold-calligraphy mt-1 group-hover:text-white transition" aria-hidden="true" />
                <span className="group-hover:text-white transition">{contactAddress}</span>
              </div>
            </div>
          </address>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <nav className="flex gap-6" aria-label="Social media links">
            {[
              { icon: FaFacebook, url: socialFacebook, title: "Facebook" },
              { icon: FaInstagram, url: socialInstagram, title: "Instagram" },
              { icon: FaTiktok, url: socialTiktok, title: "TikTok" },
              { icon: FaWhatsapp, url: `https://wa.me/${socialWhatsapp}`, title: "WhatsApp" }
            ].map((social, idx) => social.url && (
              <a 
                key={idx} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-gold-calligraphy hover:scale-110 transition duration-300 text-xl" 
                aria-label={`Visit our ${social.title} page`}
              >
                <social.icon aria-hidden="true" />
              </a>
            ))}
          </nav>

          <div className="text-center md:text-right text-gray-500 text-xs font-body tracking-wide">
            <p>&copy; {currentYear} {siteName}. All rights reserved. | <a href="/privacy" className="italic hover:text-gray-300 cursor-pointer" aria-label="Privacy Policy">Privacy Policy</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
};

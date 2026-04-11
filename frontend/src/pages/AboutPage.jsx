import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { useSiteConfig } from '../hooks/useSiteConfig';

const sections = [
  { id: 'our-story', title: 'Our Story', subtitle: "Learn about Sidra's Brushes N Ink" },
  { id: 'our-focus', title: 'Our Focus', subtitle: 'What makes us unique' },
  { id: 'custom-art', title: 'Custom Art', subtitle: 'Create Your Perfect Piece' },
  { id: 'our-vision', title: 'Our Vision', subtitle: 'Art for the Soul' },
];

export const AboutPage = () => {
  const navigate = useNavigate();
  const { branding = {} } = useSiteConfig();
  const brandName = branding?.brand_name || "Sidra's Brushes N Ink";
  const [activeSection, setActiveSection] = useState('our-story');
  const sectionRefs = useRef({});

  // Intersection Observer to highlight active sidebar item on scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) {
        sectionRefs.current[section.id] = el;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <SEO
        title={`About Us - ${brandName} | Our Story & Vision`}
        description={`Learn about ${brandName} - our passion for handcrafted Islamic calligraphy, nature art, and custom paintings.`}
        url={`${import.meta.env.VITE_SITE_URL || 'https://sidrabni.com'}/about-us`}
      />

      <div className="min-h-screen">
        {/* Hero Image - Same pattern as Blog/Home */}
        <div className="bg-rose-200 w-full">
          <div className="relative w-full overflow-hidden flex justify-center items-center" style={{
            minHeight: '400px',
            maxHeight: '600px'
          }}>
            <img
              src="/sidras-brushes-ink-about-us-hero.png"
              alt={`${brandName} - About Us - Premium Handmade Islamic Calligraphy and Art`}
              className="w-full h-auto object-contain"
              style={{ maxHeight: '600px' }}
              loading="eager"
              decoding="async"
              width="1920"
              height="600"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* Main Content: Sidebar + Sections */}
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Left Sidebar Navigation */}
            <aside className="lg:w-72 flex-shrink-0">
              <nav className="lg:sticky lg:top-28 bg-white rounded-xl shadow-sm border border-paper-200 overflow-hidden">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-6 py-5 transition-all duration-300 border-l-4 ${
                      activeSection === section.id
                        ? 'border-l-gold-calligraphy bg-paper-50'
                        : 'border-l-transparent hover:bg-paper-50'
                    }`}
                    style={{ borderLeftColor: activeSection === section.id ? '#C8A951' : 'transparent' }}
                  >
                    <span
                      className={`block font-heading font-bold text-sm tracking-wide ${
                        activeSection === section.id ? 'text-gold-calligraphy' : 'text-ink-900'
                      }`}
                      style={{ color: activeSection === section.id ? '#C8A951' : undefined }}
                    >
                      {section.title}
                    </span>
                    <span
                      className={`block text-xs mt-1 ${
                        activeSection === section.id ? 'text-gold-calligraphy opacity-80' : 'text-ink-500'
                      }`}
                      style={{ color: activeSection === section.id ? '#C8A951' : undefined }}
                    >
                      {section.subtitle}
                    </span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Right Content */}
            <div className="flex-1 min-w-0">

              {/* ═══════════ OUR STORY ═══════════ */}
              <section id="our-story" className="mb-20 scroll-mt-28">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-ink-900 mb-8 italic">Our Story</h2>

                <div className="bg-white rounded-xl shadow-sm border border-paper-200 p-8 md:p-10 space-y-6">
                  <p className="text-ink-700 font-body text-lg leading-relaxed">
                    <strong className="text-ink-900">{brandName}</strong> is a creative art studio offering premium
                    handmade paintings and Islamic calligraphy inspired by nature, skies, and peaceful landscapes.
                  </p>

                  <p className="text-ink-600 font-body leading-relaxed">
                    We focus on <strong className="text-ink-900">quality, originality, and custom designs</strong> that
                    turn ideas into meaningful artwork for homes, businesses, and special gifts. Every piece is crafted
                    with passion and attention to detail, ensuring that it brings a touch of elegance and serenity to
                    any space.
                  </p>
                </div>
              </section>

              {/* ═══════════ OUR FOCUS ═══════════ */}
              <section id="our-focus" className="mb-20 scroll-mt-28">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-ink-900 mb-8 italic">What Makes Us Unique</h2>

                <div className="space-y-6">
                  {/* Card 1 */}
                  <div className="bg-white rounded-xl shadow-sm border border-paper-200 p-8 md:p-10">
                    <h3 className="text-xl font-heading font-bold text-ink-900 mb-3">Traditional Meets Modern</h3>
                    <p className="text-ink-600 font-body leading-relaxed">
                      We specialize in blending traditional Islamic calligraphy with modern landscape elements,
                      creating a unique fusion that speaks to the soul.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white rounded-xl shadow-sm border border-paper-200 p-8 md:p-10">
                    <h3 className="text-xl font-heading font-bold text-ink-900 mb-3">Handmade Excellence</h3>
                    <p className="text-ink-600 font-body leading-relaxed">
                      Each artwork is meticulously hand-crafted with premium materials, ensuring authenticity
                      and quality in every brushstroke.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white rounded-xl shadow-sm border border-paper-200 p-8 md:p-10">
                    <h3 className="text-xl font-heading font-bold text-ink-900 mb-3">Inspired by Nature</h3>
                    <p className="text-ink-600 font-body leading-relaxed">
                      Our art draws deeply from the beauty of nature — moonlit skies, cherry blossoms, sunsets, and
                      peaceful landscapes that bring serenity to your walls.
                    </p>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-white rounded-xl shadow-sm border border-paper-200 p-8 md:p-10">
                    <h3 className="text-xl font-heading font-bold text-ink-900 mb-3">Faith & Art United</h3>
                    <p className="text-ink-600 font-body leading-relaxed">
                      Islamic calligraphy is at the heart of what we do — from Quranic verses to Dhikr art, each
                      piece is created with spiritual intention and artistic beauty.
                    </p>
                  </div>
                </div>
              </section>

              {/* ═══════════ CUSTOM ART ═══════════ */}
              <section id="custom-art" className="mb-20 scroll-mt-28">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-ink-900 mb-8 italic">Create Your Perfect Piece</h2>

                <div className="bg-white rounded-xl shadow-sm border border-paper-200 p-8 md:p-10">
                  <p className="text-ink-600 font-body leading-relaxed mb-8">
                    Whether it's a personalized gift or a statement piece for your office, we work closely
                    with you to bring your artistic vision to life.
                  </p>

                  <ul className="space-y-5">
                    {[
                      'Custom commissions tailored to your preferences',
                      'Multiple sizes and framing options available',
                      'Personal consultation with our artists',
                      'Certificate of authenticity with each piece',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="flex-shrink-0 mt-0.5" style={{ color: '#C8A951' }}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-ink-700 font-body">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-10">
                    <button
                      onClick={() => navigate('/custom-orders')}
                      className="px-8 py-3 font-body font-medium tracking-widest text-sm uppercase transition-all duration-300 rounded-sm shadow-md"
                      style={{ backgroundColor: '#C8A951', color: '#fff' }}
                      onMouseOver={(e) => { e.target.style.backgroundColor = '#b8973e'; }}
                      onMouseOut={(e) => { e.target.style.backgroundColor = '#C8A951'; }}
                    >
                      Start Your Custom Order
                    </button>
                  </div>
                </div>
              </section>

              {/* ═══════════ OUR VISION ═══════════ */}
              <section id="our-vision" className="mb-10 scroll-mt-28">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-ink-900 mb-8 italic">Our Vision</h2>

                <div className="bg-white rounded-xl shadow-sm border border-paper-200 p-8 md:p-10 space-y-8">
                  {/* Tagline */}
                  <p
                    className="text-3xl md:text-4xl font-script text-center leading-snug"
                    style={{ color: '#C8A951' }}
                  >
                    Art for the Soul, Inspired by Nature.
                  </p>

                  <p className="text-ink-600 font-body leading-relaxed text-center max-w-2xl mx-auto">
                    We believe that art has the power to transform spaces, inspire minds, and connect people
                    to deeper meanings. Our mission is to create beautiful, meaningful artwork that brings
                    peace and joy to every home and heart.
                  </p>

                  {/* Quote */}
                  <div
                    className="rounded-lg p-6 text-center"
                    style={{ backgroundColor: '#faf6ee', borderLeft: '4px solid #C8A951' }}
                  >
                    <p className="text-ink-800 font-body italic text-lg">
                      Every brushstroke tells a story. Every piece carries a soul.
                    </p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;

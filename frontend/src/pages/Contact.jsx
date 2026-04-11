import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { contactService } from '../services/api';
import { FaPaperPlane, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { SEO } from '../components/SEO';

export const ContactPage = () => {
  const { contact = {} } = useSiteConfig();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await contactService.submit(data);
      toast.success('Message sent successfully!');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <SEO
        title="Contact Us - Sidra's Brushes N Ink"
        description="Get in touch with Sidra's Brushes N Ink for inquiries about artworks, custom orders, or collaborations."
        url={`${import.meta.env.VITE_SITE_URL || 'https://sidrabni.com'}/contact`}
      />
      <h1 className="text-4xl font-serif font-bold text-center mb-12 text-ink-900">Get in Touch</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Contact Info Cards */}
        <div className="bg-paper-100 p-8 rounded-sm text-center border border-ink-800 border-opacity-10">
          <FaPhone className="text-4xl text-gold-calligraphy mx-auto mb-4" />
          <h3 className="font-serif font-bold text-xl mb-2 text-ink-900">Phone</h3>
          <p className="text-ink-800 italic">{contact.contact_phone || '03275693892'}</p>
        </div>

        <div className="bg-paper-100 p-8 rounded-sm text-center border border-ink-800 border-opacity-10">
          <FaEnvelope className="text-4xl text-gold-calligraphy mx-auto mb-4" />
          <h3 className="font-serif font-bold text-xl mb-2 text-ink-900">Email</h3>
          <p className="text-ink-800 italic">{contact.contact_email || 'hello@sidraink.com'}</p>
        </div>

        <div className="bg-paper-100 p-8 rounded-sm text-center border border-ink-800 border-opacity-10">
          <FaMapMarkerAlt className="text-4xl text-gold-calligraphy mx-auto mb-4" />
          <h3 className="font-serif font-bold text-xl mb-2 text-ink-900">Location</h3>
          <p className="text-ink-800 italic">{contact.contact_address || 'Lahore, Pakistan'}</p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold mb-2">Full Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-ink-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold-calligraphy bg-white font-serif"
              />
              {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold mb-2">Email Address</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                })}
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-ink-800 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold-calligraphy bg-white font-serif"
              />
              {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold mb-2">Phone Number</label>
            <input
              {...register('phone', { required: 'Phone is required' })}
              placeholder="03001234567"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
            {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-bold mb-2">Subject</label>
            <input
              {...register('subject', { required: 'Subject is required' })}
              placeholder="What is this about?"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
            {errors.subject && <span className="text-red-500 text-sm">{errors.subject.message}</span>}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-bold mb-2">Message</label>
            <textarea
              {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Minimum 10 characters' } })}
              placeholder="Your message here..."
              rows="6"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"
            />
            {errors.message && <span className="text-red-500 text-sm">{errors.message.message}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-rose-200 text-ink-900 py-4 rounded-sm font-serif font-bold text-lg tracking-widest uppercase hover:bg-rose-300 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaPaperPlane /> {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {/* FAQ Section */}
      <div className="max-w-2xl mx-auto mt-16">
        <h2 className="text-2xl font-serif font-bold mb-8 text-center text-ink-900">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
            <summary className="font-bold text-lg">How long does shipping take?</summary>
            <p className="mt-2 text-gray-700">Usually 7-10 business days within Pakistan.</p>
          </details>
       
          <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
            <summary className="font-bold text-lg">Do you offer custom artworks?</summary>
            <p className="mt-2 text-gray-700">Yes! Contact us for custom order details and pricing.</p>
          </details>
        </div>
      </div>
    </div>
  );
};

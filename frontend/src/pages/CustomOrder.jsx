import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { customOrderService } from '../services/api';
import { FaPaintBrush, FaImage } from 'react-icons/fa';
import { SEO } from '../components/SEO';

export const CustomOrderPage = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [imagePreview, setImagePreview] = useState(null);
  const [referenceFile, setReferenceFile] = useState(null);

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReferenceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('type', data.type);
      formData.append('size', data.size);
      formData.append('budget', data.budget);
      formData.append('description', data.description);

      if (referenceFile) {
        formData.append('reference_image', referenceFile);
        console.log('Appending reference image:', referenceFile.name, referenceFile.size);
      } else {
        console.log('No reference file selected');
      }

      await customOrderService.create(formData);
      toast.success('Custom order request submitted!');
      reset();
      setImagePreview(null);
      setReferenceFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <SEO
        title="Custom Artwork Order - Sidra's Brushes N Ink"
        description="Commission a custom painting or calligraphy piece. Tell us your vision and our talented artists will bring it to life."
        url={`${import.meta.env.VITE_SITE_URL || 'https://sidrabni.com'}/custom-orders`}
      />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <FaPaintBrush className="text-5xl text-gold-calligraphy mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-ink-900">Custom Artwork Order</h1>
          <p className="text-ink-600 text-lg font-subheading italic">Tell us your vision and let's create something amazing together</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 md:p-12 rounded-sm shadow-xl border border-paper-200 space-y-8">
          {/* Personal Information */}
          <fieldset className="border-b border-paper-200 pb-8">
            <legend className="text-2xl font-heading font-bold mb-6 text-ink-800 border-b-2 border-gold-calligraphy pb-1 inline-block">Your Information</legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-ink-700 font-body">Full Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-ink-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-calligraphy focus:border-gold-calligraphy bg-paper-50 font-body transition-colors"
                />
                {errors.name && <span className="text-red-500 text-sm mt-1 block font-body">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-ink-700 font-body">Email</label>
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-ink-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-calligraphy focus:border-gold-calligraphy bg-paper-50 font-body transition-colors"
                />
                {errors.email && <span className="text-red-500 text-sm mt-1 block font-body">{errors.email.message}</span>}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold mb-2 text-ink-700 font-body">Phone</label>
              <input
                {...register('phone', { required: 'Phone is required' })}
                placeholder="03001234567"
                className="w-full px-4 py-3 border border-ink-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-calligraphy focus:border-gold-calligraphy bg-paper-50 font-body transition-colors"
              />
              {errors.phone && <span className="text-red-500 text-sm mt-1 block font-body">{errors.phone.message}</span>}
            </div>
          </fieldset>

          {/* Artwork Details */}
          <fieldset className="border-b border-paper-200 pb-8">
            <legend className="text-2xl font-heading font-bold mb-6 text-ink-800 border-b-2 border-gold-calligraphy pb-1 inline-block">Artwork Details</legend>

            <div>
              <label className="block text-sm font-bold mb-2 text-ink-700 font-body">Artwork Type</label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="w-full px-4 py-3 border border-ink-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-calligraphy focus:border-gold-calligraphy bg-paper-50 font-body transition-colors"
              >
                <option value="">Select type</option>
                <option value="Islamic Calligraphy">Islamic Calligraphy</option>
                <option value="Name Calligraphy">Name Calligraphy</option>
                <option value="Nature Art">Nature Art</option>
                <option value="Cute Aesthetic Cartoon Characters">Cute Aesthetic Cartoon Characters</option>
                <option value="Tote Bags">Tote Bags</option>
                <option value="Other">Other</option>
              </select>
              {errors.type && <span className="text-red-500 text-sm mt-1 block font-body">{errors.type.message}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-ink-700 font-body">Preferred Size</label>
                <select
                  {...register('size', { required: 'Size is required' })}
                  className="w-full px-4 py-3 border border-ink-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-calligraphy focus:border-gold-calligraphy bg-paper-50 font-body transition-colors"
                >
                  <option value="">Select size</option>
                  <option value="small">Small (A5 - 5x7 inches)</option>
                  <option value="medium">Medium (A4 - 8x10 inches)</option>
                  <option value="large">Large (A3 - 11x14 inches)</option>
                  <option value="extra-large">Extra Large (16x20 inches)</option>
                  <option value="custom">Custom Size</option>
                </select>
                {errors.size && <span className="text-red-500 text-sm mt-1 block font-body">{errors.size.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-ink-700 font-body">Budget (Rs.)</label>
                <input
                  {...register('budget', { required: 'Budget is required' })}
                  type="number"
                  placeholder="5000"
                  className="w-full px-4 py-3 border border-ink-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-calligraphy focus:border-gold-calligraphy bg-paper-50 font-body transition-colors"
                />
                {errors.budget && <span className="text-red-500 text-sm mt-1 block font-body">{errors.budget.message}</span>}
              </div>
            </div>
          </fieldset>

          {/* Description */}
          <fieldset className="border-b border-paper-200 pb-8">
            <legend className="text-2xl font-heading font-bold mb-6 text-ink-800 border-b-2 border-gold-calligraphy pb-1 inline-block">Your Vision</legend>

            <div>
              <label className="block text-sm font-bold mb-2 text-ink-700 font-body">Detailed Description</label>
              <textarea
                {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Minimum 20 characters' } })}
                placeholder="Describe your artwork idea in detail. What colors, mood, elements should be included?"
                rows="5"
                className="w-full px-4 py-3 border border-ink-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-gold-calligraphy focus:border-gold-calligraphy bg-paper-50 font-body transition-colors resize-none"
              />
              {errors.description && <span className="text-red-500 text-sm mt-1 block font-body">{errors.description.message}</span>}
            </div>
          </fieldset>

          {/* Reference Image */}
          <fieldset className="pb-4">
            <legend className="text-xl font-heading font-bold mb-4 text-ink-800">Reference Material (Optional)</legend>

            <div className={`bg-paper-50 border-2 border-dashed rounded-sm p-8 text-center hover:bg-gold-calligraphy/5 transition-colors cursor-pointer group ${referenceFile ? 'border-green-400 bg-green-50' : 'border-gold-calligraphy/50'}`}>
              <FaImage className={`text-4xl mx-auto mb-3 opacity-70 group-hover:opacity-100 transition-opacity ${referenceFile ? 'text-green-500' : 'text-gold-calligraphy'}`} />
              <label className="block cursor-pointer">
                <span className="text-sm font-bold text-ink-700 font-body group-hover:text-gold-calligraphy transition-colors">
                  {referenceFile ? '✓ Change reference image' : 'Upload reference image or inspiration'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="hidden"
                />
              </label>
              {referenceFile ? (
                <p className="text-xs text-green-600 font-bold mt-2">✓ Selected: {referenceFile.name}</p>
              ) : (
                <p className="text-xs text-ink-500 mt-2 font-body">PNG, JPG, GIF, WEBP up to 5MB</p>
              )}
            </div>

            {imagePreview && (
              <div className="mt-6 p-2 bg-white shadow-sm border border-paper-200 inline-block rotate-1">
                <p className="text-sm font-bold mb-2 text-ink-700 font-body">Preview:</p>
                <img src={imagePreview} alt="Preview" className="max-w-xs h-40 object-cover" />
              </div>
            )}
          </fieldset>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gold-calligraphy text-ink-900 py-4 rounded-sm font-heading font-bold text-lg tracking-widest uppercase hover:bg-gold-highlight hover:text-white transition-all duration-300 disabled:opacity-50 shadow-md"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>

          <p className="text-center text-ink-500 text-sm font-body italic mt-4">
            We'll review your request and contact you within 24 hours with pricing and timeline.
          </p>
        </form>
      </div>
    </div>
  );
};

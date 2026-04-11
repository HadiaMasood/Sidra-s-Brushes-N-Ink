import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { artworkService } from '../services/api';
import api from '../services/api';
import { ImageManager } from './ImageManager';
import toast from 'react-hot-toast';
import { getArtworkImageUrl } from '../utils/imageUtils';

export const ArtworkForm = ({ artwork = null, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      ...artwork,
      category: typeof artwork?.category === 'object' ? artwork.category?.name : (artwork?.category || ''),
      active: artwork?.active ?? true,
      featured: artwork?.featured ?? false,
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories via categoryService...');
        const response = await api.get('/categories');
        console.log('Categories response received:', response);

        let cats = [];
        if (Array.isArray(response)) {
          cats = response;
        } else if (response && Array.isArray(response.data)) {
          cats = response.data;
        } else if (response && response.categories && Array.isArray(response.categories)) {
          cats = response.categories;
        }

        console.log(`Setting ${cats.length} categories in state`);
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState(artwork ? [getArtworkImageUrl(artwork)] : []);
  const [showImageManager, setShowImageManager] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      console.log('=== FORM SUBMISSION ===');
      console.log('Artwork ID:', artwork?.id);
      console.log('Selected Files:', selectedFiles.length);

      // First, update all fields except image
      const updateData = new FormData();
      updateData.append('title', data.title || '');
      updateData.append('description', data.description || '');
      updateData.append('price', data.price || '');
      updateData.append('dimensions', data.dimensions || '');
      updateData.append('medium', data.medium || '');
      updateData.append('artist', data.artist || '');
      updateData.append('year_created', data.year_created || '');
      updateData.append('category', data.category || '');
      updateData.append('stock_quantity', data.stock_quantity || '');
      updateData.append('active', data.active ? 1 : 0);
      updateData.append('featured', data.featured ? 1 : 0);

      // Add images if selected
      if (selectedFiles.length > 0) {
        console.log(`Adding ${selectedFiles.length} image files`);
        selectedFiles.forEach((file) => {
          updateData.append('images[]', file);
        });
      }

      console.log('FormData entries:');
      for (let [key, value] of updateData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      if (artwork) {
        console.log('Calling update for artwork ID:', artwork.id);

        try {
          const response = await artworkService.update(artwork.id, updateData);
          console.log('Update response:', response);

          toast.success('Artwork updated successfully');

          // Dispatch event to refresh gallery
          window.dispatchEvent(new CustomEvent('artworkUpdated', {
            detail: { id: artwork.id, data: response.data }
          }));
        } catch (error) {
          console.error('Update error:', error);
          throw error;
        }
      } else {
        if (selectedFiles.length === 0) {
          toast.error('At least one image is required for new artworks');
          setLoading(false);
          return;
        }
        console.log('Calling create for new artwork');

        try {
          const response = await artworkService.create(updateData);
          console.log('Create response:', response);

          toast.success('Artwork created successfully');

          // Dispatch event to refresh gallery
          window.dispatchEvent(new CustomEvent('artworkCreated', {
            detail: { data: response.data }
          }));
        } catch (error) {
          console.error('Create error:', error);
          throw error;
        }
      }

      onSuccess?.();
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMsg = error.response?.data?.message || error.message || 'Error saving artwork';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      console.log(`${files.length} images selected`);
      setSelectedFiles(files);

      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title *</label>
        <input {...register('title', { required: true })} className="mt-1 w-full px-3 py-2 border rounded-md" />
        {errors.title && <span className="text-red-500 text-sm">Title is required</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description *</label>
        <textarea {...register('description', { required: true })} rows="4" className="mt-1 w-full px-3 py-2 border rounded-md" />
        {errors.description && <span className="text-red-500 text-sm">Description is required</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Price *</label>
        <input type="number" step="0.01" {...register('price', { required: true })} className="mt-1 w-full px-3 py-2 border rounded-md" placeholder="e.g., 5000" />
        {errors.price && <span className="text-red-500 text-sm">Price is required</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <input
          {...register('category')}
          list="category-suggestions"
          className="mt-1 w-full px-3 py-2 border rounded-md"
          placeholder="e.g., Floral, Abstract, Calligraphy"
        />
        <datalist id="category-suggestions">
          {categories.map(cat => (
            <option key={cat.id} value={cat.name} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Images {!artwork && '*'}</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="mt-1 w-full"
        />
        {!artwork && selectedFiles.length === 0 && <span className="text-red-500 text-sm">Image is required for new artworks</span>}

        {previewImages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {previewImages.map((src, index) => (
              <img key={index} src={src} alt={`Preview ${index + 1}`} className="h-32 w-32 object-cover rounded border" />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Dimensions</label>
          <input {...register('dimensions')} placeholder="e.g., 24x36 inches" className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Medium</label>
          <input {...register('medium')} placeholder="e.g., Oil on Canvas" className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
          <input type="number" {...register('stock_quantity')} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center">
          <input type="checkbox" {...register('active')} className="mr-2" />
          <span className="text-sm font-medium text-gray-700">Active (Show in Gallery)</span>
        </label>
        <label className="flex items-center">
          <input type="checkbox" {...register('featured')} className="mr-2" />
          <span className="text-sm font-medium text-gray-700">Featured</span>
        </label>
      </div>

      <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Artwork'}
      </button>

      {artwork && (
        <div className="mt-6 pt-6 border-t">
          <button
            type="button"
            onClick={() => setShowImageManager(!showImageManager)}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-4"
          >
            {showImageManager ? 'Hide Image Manager' : `Manage Images ${artwork?.images?.length ? `(${artwork.images.length})` : ''}`}
          </button>
          {showImageManager && (
            <ImageManager
              artworkId={artwork.id}
              onImagesUpdate={onSuccess}
            />
          )}
        </div>
      )}
    </form>
  );
};

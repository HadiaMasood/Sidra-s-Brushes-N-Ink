import React, { useState, useEffect } from 'react';
import { imageService } from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';

export const ImageManager = ({ artworkId, onImagesUpdate }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadImages();
  }, [artworkId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await imageService.getAll(artworkId);
      setImages(response.data || []);
    } catch (error) {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();

      // Handle multiple files
      if (files.length > 1) {
        files.forEach((file) => {
          formData.append('images[]', file);
        });
      } else {
        // Single file
        formData.append('image', files[0]);
        formData.append('alt_text', files[0].name);
      }

      const response = await imageService.upload(artworkId, formData);

      // Response data can be a single object or array depending on backend response
      const newImages = Array.isArray(response.data) ? response.data : [response.data];

      setImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded successfully`);
      onImagesUpdate?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image(s)');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(Array.from(e.target.files));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter(file =>
        file.type.startsWith('image/')
      );

      if (validFiles.length > 0) {
        handleUpload(validFiles);
      } else {
        toast.error('Please upload image files only');
      }
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await imageService.update(artworkId, imageId, { is_primary: true });
      setImages(images.map(img => ({
        ...img,
        is_primary: img.id === imageId,
      })));
      toast.success('Primary image updated');
      onImagesUpdate?.();
    } catch (error) {
      toast.error('Failed to update primary image');
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      await imageService.delete(artworkId, imageId);
      setImages(images.filter(img => img.id !== imageId));
      toast.success('Image deleted');
      onImagesUpdate?.();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleUpdateAlt = async (imageId, altText) => {
    try {
      await imageService.update(artworkId, imageId, { alt_text: altText });
      setImages(images.map(img =>
        img.id === imageId ? { ...img, alt_text: altText } : img
      ));
      toast.success('Alt text updated');
    } catch (error) {
      toast.error('Failed to update alt text');
    }
  };

  if (loading) return <div className="text-center py-4">Loading images...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Manage Images</h3>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${dragActive ? 'border-amber-600 bg-amber-50' : 'border-gray-300'
          }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          disabled={uploading}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="text-gray-600">
            {uploading ? (
              <p>Uploading...</p>
            ) : (
              <>
                <p className="font-semibold">Drag images here or click to upload</p>
                <p className="text-sm text-gray-500">PNG, JPG, GIF, WebP up to 5MB</p>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(image => (
            <div key={image.id} className="relative group">
              <div className="relative overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={getImageUrl(image.image_path) || image.image_url}
                  alt={image.alt_text}
                  className="w-full h-32 object-cover"
                />
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-amber-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    Primary
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {!image.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(image.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                    title="Set as primary"
                  >
                    ⭐
                  </button>
                )}
                <button
                  onClick={() => handleDelete(image.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>

              {/* Alt Text Input */}
              <input
                type="text"
                value={image.alt_text || ''}
                onChange={(e) => handleUpdateAlt(image.id, e.target.value)}
                placeholder="Alt text"
                className="w-full mt-2 px-2 py-1 text-sm border rounded"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No images uploaded yet. Upload your first image above.
        </div>
      )}
    </div>
  );
};

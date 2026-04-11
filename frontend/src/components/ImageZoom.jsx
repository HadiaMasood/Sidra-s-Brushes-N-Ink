import React from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../styles/ImageZoom.css';

export const ImageZoom = ({ imageUrl, title, isOpen, onClose, images = [] }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentImage = images.length > 0 ? images[currentImageIndex] : imageUrl;

  return (
    <div className="image-zoom-backdrop" onClick={handleBackdropClick}>
      <div className="image-zoom-container">
        {/* Close Button */}
        <button className="zoom-close" onClick={onClose}>
          <FaTimes />
        </button>

        {/* Main Image */}
        <div className="zoom-image-wrapper">
          <img
            src={currentImage}
            alt={title}
            className="zoom-image"
          />
        </div>

        {/* Navigation Arrows (if multiple images) */}
        {images.length > 1 && (
          <>
            <button className="zoom-nav zoom-prev" onClick={handlePrev}>
              <FaChevronLeft />
            </button>
            <button className="zoom-nav zoom-next" onClick={handleNext}>
              <FaChevronRight />
            </button>

            {/* Image Counter */}
            <div className="zoom-counter">
              {currentImageIndex + 1} / {images.length}
            </div>

            {/* Thumbnail Strip */}
            <div className="zoom-thumbnails">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(idx)}
                />
              ))}
            </div>
          </>
        )}

        {/* Image Title */}
        {title && <p className="zoom-title">{title}</p>}
      </div>
    </div>
  );
};

export default ImageZoom;

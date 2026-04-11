/**
 * Alt Text Generator for Better SEO
 * Generates descriptive alt text for images based on artwork data
 */

export const generateAltText = (artwork) => {
  if (!artwork) return 'Artwork';
  
  const altText = artwork.alt_text || artwork.title;
  
  // Enhance with additional context if available
  if (artwork.category) {
    return `${altText} - ${artwork.category}`;
  }
  
  return altText;
};

export const generateDetailedAltText = (artwork) => {
  if (!artwork) return 'Artwork Image';
  
  const parts = [
    artwork.title || 'Artwork',
    artwork.category ? `by ${artwork.category}` : '',
    artwork.artist ? `Artist: ${artwork.artist}` : '',
    artwork.medium ? `Medium: ${artwork.medium}` : ''
  ];
  
  return parts
    .filter(part => part)
    .join(' - ')
    .substring(0, 125); // Keep under 125 chars for optimal SEO
};

export const generateImageDescription = (artwork) => {
  if (!artwork) return 'A beautiful handcrafted artwork';
  
  const descriptions = {
    'Islamic Calligraphy': 'A stunning Islamic calligraphy piece',
    'Name Calligraphy': 'A personalized name calligraphy artwork',
    'Nature Art': 'A beautiful nature and landscape painting',
    'Cute Aesthetic Cartoon Characters': 'A cute and adorable cartoon character artwork',
    'Tote Bags': 'A hand-painted artistic tote bag',
  };
  
  const baseDesc = descriptions[artwork.category] || 'A beautiful handcrafted artwork';
  return `${baseDesc} by Sidra's Brushes N Ink - ${artwork.title}`;
};

/**
 * Batch update alt text for multiple artworks
 */
export const batchGenerateAltText = (artworks) => {
  return artworks.map(artwork => ({
    ...artwork,
    alt_text: generateDetailedAltText(artwork)
  }));
};

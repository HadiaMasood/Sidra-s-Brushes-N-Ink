import { Helmet } from 'react-helmet';

export const SEO = ({
  title = "Sidra's Brushes N Ink - Authentic Art Gallery",
  description = "Discover beautiful handcrafted artworks at Sidra's Brushes N Ink. Buy paintings, sketches, and art prints from talented artists.",
  image = 'https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=1200',
  url = import.meta.env.VITE_SITE_URL || 'https://sidrabni.com',
  type = 'website',
  favicon = '/sidra-inkbox-brushes-logo.jpeg',
  keywords = 'islamic calligraphy, handmade art, custom paintings, nature art, canvas art, Pakistan art gallery',
  author = "Sidra's Brushes N Ink",
  publishedTime,
  modifiedTime,
}) => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://sidrabni.com';
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Favicon */}
      <link rel="icon" type="image/jpeg" href={favicon} />
      <link rel="apple-touch-icon" href={favicon} />
      <link rel="shortcut icon" href={favicon} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Sidra's Brushes N Ink" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@sidrasbrushesnink" />
      <meta name="twitter:creator" content="@sidrasbrushesnink" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Alternate for mobile */}
      <link rel="alternate" media="only screen and (max-width: 640px)" href={url} />
      
      {/* DNS Prefetch & Preconnect */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://images.unsplash.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#8B4513" />
      <meta name="msapplication-TileColor" content="#8B4513" />
      
      {/* Geo Tags */}
      <meta name="geo.region" content="PK" />
      <meta name="geo.placename" content="Pakistan" />
      
      {/* Additional SEO */}
      <meta name="rating" content="General" />
      <meta name="distribution" content="global" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    </Helmet>
  );
};

export const OrganizationSchema = () => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://sidrabni.com';
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Sidra's Brushes N Ink",
    "url": siteUrl,
    "logo": `${siteUrl}/sidra-inkbox-brushes-logo.jpeg`,
    "description": "Authentic Art Gallery specializing in Islamic Calligraphy, Nature Art, and Custom Paintings",
    "sameAs": [
      "https://facebook.com/sidrasbrushesnink",
      "https://instagram.com/sidrasbrushesnink",
      "https://twitter.com/sidrasbrushesnink"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-327-5693892",
      "contactType": "customer service",
      "areaServed": "PK",
      "availableLanguage": ["English", "Urdu"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PK"
    }
  };
  return <StructuredData data={schema} />;
};

export const WebsiteSchema = () => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://sidrabni.com';
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Sidra's Brushes N Ink",
    "url": siteUrl,
    "description": "Authentic Art Gallery - Handcrafted Islamic Calligraphy, Nature Art & Custom Paintings",
    "publisher": {
      "@type": "Organization",
      "name": "Sidra's Brushes N Ink",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/sidra-inkbox-brushes-logo.jpeg`
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/gallery?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
  return <StructuredData data={schema} />;
};

export const StructuredData = ({ data }) => {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
};

export const ProductSchema = ({ product }) => {
  if (!product) return null;
  
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://sidrabni.com';
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description || product.title,
    "image": product.image_url || product.image_path,
    "sku": `ART-${product.id}`,
    "brand": {
      "@type": "Brand",
      "name": "Sidra's Brushes N Ink"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "PKR",
      "availability": product.is_active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `${siteUrl}/gallery`,
      "seller": {
        "@type": "Organization",
        "name": "Sidra's Brushes N Ink"
      }
    }
  };
  
  if (product.reviews && product.reviews.length > 0) {
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / product.reviews.length;
    
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avgRating.toFixed(1),
      "reviewCount": product.reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    };
    
    schema.review = product.reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": review.customer_name || "Anonymous"
      },
      "reviewBody": review.comment
    }));
  }
  
  return <StructuredData data={schema} />;
};

export const BreadcrumbSchema = ({ items }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
  return <StructuredData data={schema} />;
};

export const BlogPostSchema = ({ post }) => {
  if (!post) return null;
  
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://sidrabni.com';
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || post.content?.substring(0, 160),
    "image": post.featured_image,
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": {
      "@type": "Person",
      "name": post.author || "Sidra's Brushes N Ink"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sidra's Brushes N Ink",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/sidra-inkbox-brushes-logo.jpeg`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`
    }
  };
  
  return <StructuredData data={schema} />;
};

export const LocalBusinessSchema = () => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://sidrabni.com';
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Sidra's Brushes N Ink",
    "image": `${siteUrl}/sidra-inkbox-brushes-logo.jpeg`,
    "description": "Authentic Art Gallery specializing in Islamic Calligraphy, Nature Art, and Custom Paintings",
    "url": siteUrl,
    "telephone": "+92-327-5693892",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Pakistan",
      "addressLocality": "Pakistan",
      "addressCountry": "PK"
    },
    "sameAs": [
      "https://facebook.com/sidrasbrushesnink",
      "https://instagram.com/sidrasbrushesnink",
      "https://twitter.com/sidrasbrushesnink"
    ],
    "priceRange": "PKR 2,000 - 50,000",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "09:00",
      "closes": "22:00"
    }
  };
  return <StructuredData data={schema} />;
};

export const FAQSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What types of art do you offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We specialize in Islamic Calligraphy, Nature Art, Custom Paintings, Tote Bags, Name Calligraphy, and Cute Aesthetic Cartoon Characters. All items are handcrafted by talented artists."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer custom orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We offer custom artwork commissions. You can request personalized designs through our Custom Orders page with detailed specifications and timeline."
        }
      },
      {
        "@type": "Question",
        "name": "What is the delivery time for orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Standard delivery takes 7-14 business days within Pakistan. Custom orders may take 2-4 weeks depending on complexity. Expedited delivery is available for additional charges."
        }
      },
      {
        "@type": "Question",
        "name": "Do you ship internationally?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Currently, we ship within Pakistan. International shipping will be available soon. Contact us for inquiries."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods do you accept?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We accept multiple payment methods including JazzCash, EasyPaisa, Bank Transfers, and Card payments for your convenience."
        }
      },
      {
        "@type": "Question",
        "name": "Can I return or exchange items?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer returns and exchanges within 7 days of delivery if items are unused and in original condition. Custom orders are non-returnable unless there's a defect."
        }
      },
      {
        "@type": "Question",
        "name": "How long do framed artworks last?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our framed artworks are created with high-quality materials and can last for many years. We use UV-protective glass for longevity and protection from fading."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer bulk orders or corporate gifts?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We offer special pricing for bulk orders and corporate gifts. Please contact us directly for bulk order quotations."
        }
      }
    ]
  };
  return <StructuredData data={schema} />;
};

export const ImageObjectSchema = ({ imageUrl, imageAlt, imageWidth = 1200, imageHeight = 630 }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "url": imageUrl,
    "name": imageAlt,
    "description": imageAlt,
    "width": imageWidth,
    "height": imageHeight
  };
  return <StructuredData data={schema} />;
};


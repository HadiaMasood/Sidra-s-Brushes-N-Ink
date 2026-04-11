// Organization Schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Sidra's Brushes N Ink",
  "url": "https://sidrabni.com",
  "logo": "https://sidrabni.com/logo.png",
  "description": "Authentic Art Gallery and E-Commerce Platform",
  "sameAs": [
    "https://www.facebook.com/sidrasbrushesnink",
    "https://www.instagram.com/sidrasbrushesnink",
    "https://www.twitter.com/sidrasbrushesnink",
    "https://www.pinterest.com/sidrasbrushesnink"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+92-300-1234567",
    "contactType": "Customer Service",
    "email": "hello@sidraink.com"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Art Gallery Street",
    "addressLocality": "Lahore",
    "addressRegion": "Punjab",
    "postalCode": "54000",
    "addressCountry": "PK"
  }
};

// LocalBusiness Schema
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Sidra's Brushes N Ink",
  "image": "https://sidrabni.com/logo.png",
  "description": "Authentic handcrafted artworks and paintings",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Art Gallery Street",
    "addressLocality": "Lahore",
    "addressRegion": "Punjab",
    "postalCode": "54000",
    "addressCountry": "PK"
  },
  "telephone": "+92-300-1234567",
  "email": "hello@sidraink.com",
  "url": "https://sidrabni.com",
  "priceRange": "Rs. 2000 - Rs. 50000",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "10:00",
    "closes": "18:00"
  }
};

// Product Schema (for artworks)
export const productSchema = (artwork) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": artwork.title,
  "description": artwork.description,
  "image": artwork.image_path,
  "brand": {
    "@type": "Brand",
    "name": "Sidra's Brushes N Ink"
  },
  "offers": {
    "@type": "Offer",
    "url": `https://sidrabni.com/artwork/${artwork.id}`,
    "priceCurrency": "PKR",
    "price": artwork.price,
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Sidra's Brushes N Ink"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": artwork.rating || "4.5",
    "reviewCount": artwork.reviewCount || "0"
  }
});

// BreadcrumbList Schema
export const breadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// FAQPage Schema
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I place an order?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Browse our gallery, select your favorite artwork, add it to cart, and proceed to checkout. We accept multiple payment methods."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer custom orders?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! We offer custom artwork orders. Visit our Custom Orders page to submit your requirements."
      }
    },
    {
      "@type": "Question",
      "name": "What is your return policy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer 30-day returns for artworks in original condition. Contact us for more details."
      }
    },
    {
      "@type": "Question",
      "name": "How long does delivery take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Delivery typically takes 5-7 business days within Pakistan. International orders may take 2-3 weeks."
      }
    },
    {
      "@type": "Question",
      "name": "Are the artworks original?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, all artworks are original handcrafted pieces created by talented artists."
      }
    }
  ]
};

// WebPage Schema
export const webPageSchema = (title, description, url) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": title,
  "description": description,
  "url": url,
  "isPartOf": {
    "@type": "WebSite",
    "name": "Sidra's Brushes N Ink",
    "url": "https://sidrabni.com"
  }
});

// AggregateOffer Schema (for gallery page)
export const aggregateOfferSchema = (minPrice, maxPrice, offerCount) => ({
  "@context": "https://schema.org",
  "@type": "AggregateOffer",
  "priceCurrency": "PKR",
  "lowPrice": minPrice,
  "highPrice": maxPrice,
  "offerCount": offerCount,
  "availability": "https://schema.org/InStock"
});

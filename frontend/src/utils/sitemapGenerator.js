/**
 * Dynamic Sitemap Generator
 * Generates sitemap.xml based on current artworks and blog posts
 */

export const generateSitemap = (artworks = [], blogPosts = [], categories = []) => {
  const siteUrl = 'https://sidrabni.com';
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: siteUrl, priority: '1.0', changefreq: 'weekly' },
    { loc: `${siteUrl}/gallery`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${siteUrl}/about`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${siteUrl}/contact`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${siteUrl}/blog`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${siteUrl}/custom-order`, priority: '0.7', changefreq: 'monthly' },
  ];

  const categoryPages = categories.map(cat => ({
    loc: `${siteUrl}/gallery?category=${encodeURIComponent(cat.slug || cat.name)}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: today
  }));

  const artworkPages = artworks.map(artwork => ({
    loc: `${siteUrl}/gallery/${artwork.id}`,
    priority: '0.6',
    changefreq: 'monthly',
    lastmod: artwork.updated_at ? artwork.updated_at.split('T')[0] : today
  }));

  const blogPages = blogPosts.map(post => ({
    loc: `${siteUrl}/blog/${post.slug}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: post.updated_at ? post.updated_at.split('T')[0] : today
  }));

  const allPages = [...staticPages, ...categoryPages, ...artworkPages, ...blogPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod || today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
};

/**
 * Generate RSS Feed for blog posts
 */
export const generateRSSFeed = (blogPosts = []) => {
  const siteUrl = 'https://sidrabni.com';
  const today = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sidra's Brushes N Ink - Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Latest articles about Islamic Calligraphy, Art Techniques, and Creative Inspiration</description>
    <language>en-us</language>
    <lastBuildDate>${today}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${blogPosts.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <description>${escapeXml(post.excerpt || post.content?.substring(0, 200))}</description>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      ${post.featured_image ? `<enclosure url="${post.featured_image}" type="image/jpeg" />` : ''}
    </item>`).join('\n')}
  </channel>
</rss>`;

  return xml;
};

/**
 * Escape XML special characters
 */
const escapeXml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Download sitemap as file
 */
export const downloadSitemap = (xml, filename = 'sitemap.xml') => {
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

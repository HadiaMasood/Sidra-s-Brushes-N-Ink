import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { SEO } from '../components/SEO';
import { blogService } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSiteConfig } from '../hooks/useSiteConfig';

export const BlogPage = () => {
  const { branding = {} } = useSiteConfig();
  const brandName = branding?.brand_name || "Sidra's Brushes N Ink";
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [blogPosts, setBlogPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadBlogPosts();
    loadCategories();
  }, [selectedCategory, page]);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        category: selectedCategory === 'all' ? null : selectedCategory,
      };
      const response = await blogService.getAll(params);
      setBlogPosts(response.data);
      setPagination(response.meta);
    } catch (error) {
      toast.error('Failed to load blog posts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await blogService.getCategories();
      const categoryList = [
        { id: 'all', name: 'All Posts' },
        ...response.data.map(cat => ({ id: cat, name: cat.charAt(0).toUpperCase() + cat.slice(1) }))
      ];
      setCategories(categoryList);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const handleReadMore = (slug) => {
    navigate(`/blog/${slug}`);
  };

  return (
    <>
      <SEO
        title="Blog - Sidra's Brushes N Ink | Art Tips, Education & Artist Stories"
        description="Read our blog for art tips, artist spotlights, and insights into the world of contemporary art."
        url={`${import.meta.env.VITE_SITE_URL || 'https://sidrabni.com'}/blog`}
      />

      <div className="min-h-screen">
        {/* Rose Header with Wide Hero Image */}
        <div className="bg-rose-200 w-full">
          {/* Hero Section */}
          <div className="relative w-full overflow-hidden flex justify-center items-center" style={{
            minHeight: '400px',
            maxHeight: '600px'
          }}>
            <img
              src="/sidras-brushes-ink-blog-hero.png"
              alt="Sidra's Brushes N Ink Blog - Premium Handmade Art & Artistic Stories"
              className="w-full h-auto object-contain"
              style={{ maxHeight: '600px' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setPage(1);
                }}
                className={`px-6 py-2 rounded-sm font-body font-medium transition tracking-wide ${selectedCategory === category.id
                  ? 'bg-gold-calligraphy text-white shadow-md transform -translate-y-1'
                  : 'bg-white text-ink-700 border border-paper-200 hover:border-gold-calligraphy hover:text-gold-calligraphy'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-calligraphy mx-auto mb-4"></div>
              <p className="text-ink-600 font-body">Loading blog posts...</p>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-paper-200">
              <p className="text-ink-500 font-body text-lg italic">No posts found in this category.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map(post => (
                  <article
                    key={post.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border border-paper-200"
                    onClick={() => handleReadMore(post.slug)}
                  >
                    <div className="relative overflow-hidden h-56">
                      {post.featured_image ? (
                        <img
                          src={getImageUrl(post.featured_image)}
                          alt={post.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-paper-200 flex items-center justify-center text-ink-300">
                          <span className="font-heading text-4xl opacity-20">Art</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-sm text-xs font-bold text-gold-calligraphy uppercase tracking-wider shadow-sm">
                        {post.category}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs text-ink-500 mb-3 font-body">
                        <span>{new Date(post.published_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{post.read_time}</span>
                      </div>

                      <h2 className="text-2xl font-heading font-bold text-ink-900 mb-3 line-clamp-2 group-hover:text-gold-calligraphy transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-ink-600 text-sm mb-6 line-clamp-3 font-body leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-paper-100">
                        <span className="text-sm font-medium text-ink-800 font-body">
                          By {post.author}
                        </span>
                        <span className="text-gold-calligraphy font-bold text-sm hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Read <span className="text-lg">→</span>
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center gap-3 mt-16">
                  {Array.from({ length: pagination.last_page }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 flex items-center justify-center rounded-sm transition font-serif text-lg ${page === i + 1
                        ? 'bg-ink-900 text-gold-calligraphy shadow-md'
                        : 'bg-white border border-paper-200 text-ink-700 hover:border-gold-calligraphy hover:text-gold-calligraphy'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPage;

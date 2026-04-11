import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { SEO } from '../components/SEO';
import { blogService } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import toast from 'react-hot-toast';

export const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogPost();
  }, [slug]);

  const loadBlogPost = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBySlug(slug);
      setBlogPost(response.data);
    } catch (error) {
      toast.error('Blog post not found');
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (!blogPost) {
    return null;
  }

  return (
    <>
      <SEO
        title={`${blogPost.title} - Sidra's Brushes N Ink Blog`}
        description={blogPost.excerpt}
        url={`${import.meta.env.VITE_SITE_URL || 'https://sidrabni.com'}/blog/${slug}`}
      />

      <article className="min-h-screen font-body">
        {/* Hero Image */}
        {blogPost.featured_image && (
          <div className="w-full h-[500px] overflow-hidden relative">
            <img
              src={getImageUrl(blogPost.featured_image)}
              alt={blogPost.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="container mx-auto px-4 -mt-32 relative z-10 max-w-4xl">
          <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 border border-paper-200">
            {/* Meta Information */}
            <div className="mb-8 pb-8 border-b border-paper-200 text-center">
              <div className="inline-flex items-center gap-3 text-sm font-medium tracking-wider text-ink-600 mb-6 uppercase">
                <span className="text-gold-calligraphy font-bold">{blogPost.category}</span>
                <span className="w-1 h-1 bg-ink-400 rounded-full"></span>
                <span>{blogPost.read_time}</span>
                <span className="w-1 h-1 bg-ink-400 rounded-full"></span>
                <span>{new Date(blogPost.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-heading font-bold text-ink-900 mb-8 leading-tight">
                {blogPost.title}
              </h1>

              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 bg-ink-100 rounded-full flex items-center justify-center border-2 border-gold-calligraphy">
                  <span className="text-gold-calligraphy font-heading font-bold text-2xl">{blogPost.author.charAt(0)}</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-ink-900 font-heading text-lg">{blogPost.author}</p>
                  <p className="text-sm text-ink-500 italic">Art Contributor</p>
                </div>
              </div>
            </div>

            {/* Article Body */}
            <div
              className="prose prose-lg max-w-none mb-16 text-ink-700 prose-headings:font-heading prose-headings:text-ink-900 prose-a:text-gold-calligraphy prose-blockquote:border-gold-calligraphy prose-blockquote:bg-paper-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic"
              dangerouslySetInnerHTML={{
                __html: blogPost.content
                  // Handle storage images from backend
                  .replace(/src="\/storage\//g, `src="${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '')}/storage/`)
                  // Handle public folder images that don't have .png extension format issues
                  .replace(/src="([^"]*\.(png|jpg|jpeg|gif))"/g, (match, imageName) => {
                    // Check if it already has a domain
                    if (imageName.startsWith('http') || imageName.startsWith('/')) {
                      return match;
                    }
                    // Otherwise assume it's in public folder
                    return `src="/${imageName}"`;
                  })
              }}
            />

            {/* Share Section */}
            <div className="mb-12 pb-12 border-b border-paper-200">
              <h3 className="font-heading font-bold text-xl text-ink-900 mb-6 text-center">Share This Article</h3>
              <div className="flex justify-center gap-6">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center text-ink-600 hover:bg-[#3b5998] hover:text-white transition-colors"
                >
                  F
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${blogPost.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center text-ink-600 hover:bg-[#1DA1F2] hover:text-white transition-colors"
                >
                  T
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied!');
                  }}
                  className="px-4 py-2 rounded-full bg-ink-100 text-ink-600 hover:bg-gold-calligraphy hover:text-white transition-colors font-medium text-sm"
                >
                  Copy Link
                </button>
              </div>
            </div>

            {/* Author Bio */}
            <div
              className="p-8 rounded-sm mb-12 border-l-4 border-gold-calligraphy"
              style={{ background: 'rgba(255,255,255,1)', backdropFilter: 'none' }}
            >
              <h3 className="font-heading font-bold text-lg text-ink-900 mb-3">About the Author</h3>
              <p className="text-ink-600 leading-relaxed italic">
                {blogPost.author} is an art contributor at Sidra's Brushes N Ink, sharing insights and knowledge about the art world and the beauty of traditional ink practices.
              </p>
            </div>

            {/* Back to Blog */}
            <div className="text-center">
              <button
                onClick={() => navigate('/blog')}
                className="text-gold-calligraphy hover:text-ink-900 font-bold font-heading tracking-wide transition-colors group"
              >
                <span className="inline-block transition-transform group-hover:-translate-x-1">←</span> Back to Blog Overview
              </button>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default BlogPostPage;

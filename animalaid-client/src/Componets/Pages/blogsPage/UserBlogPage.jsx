import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, Eye, Heart, ArrowRight, Tag, Filter, X, Share2 } from 'lucide-react';

const UserBlogPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['All']);
  const [likedPosts, setLikedPosts] = useState(new Set());

  const API_URL = 'http://localhost:8000/api/blogs';

  useEffect(() => {
    fetchBlogPosts();
    fetchCategories();
    // Load liked posts from localStorage
    const saved = localStorage.getItem('likedPosts');
    if (saved) {
      setLikedPosts(new Set(JSON.parse(saved)));
    }
  }, []);

  useEffect(() => {
    filterPosts();
  }, [searchTerm, selectedCategory, blogPosts]);

  const fetchBlogPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/?status=published`);
      const data = await response.json();
      setBlogPosts(data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/`);
      const data = await response.json();
      const categoryNames = data.map(cat => cat.category);
      setCategories(['All', ...categoryNames]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterPosts = () => {
    let filtered = blogPosts;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s+/).length || 0;
    return Math.ceil(wordCount / wordsPerMinute) || 1;
  };

  const handleLikePost = async (post, e) => {
    e.stopPropagation();
    
    // Check if already liked
    if (likedPosts.has(post.id)) {
      return;
    }
    
    try {
      await fetch(`${API_URL}/${post.slug}/like/`, {
        method: 'POST',
      });
      
      // Update local state
      setBlogPosts(prev => prev.map(p => 
        p.id === post.id ? { ...p, likes: (p.likes || 0) + 1 } : p
      ));
      
      // Mark as liked
      const newLiked = new Set(likedPosts);
      newLiked.add(post.id);
      setLikedPosts(newLiked);
      localStorage.setItem('likedPosts', JSON.stringify([...newLiked]));
      
      if (selectedPost && selectedPost.id === post.id) {
        setSelectedPost(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const openPost = async (post) => {
    setSelectedPost(post);
    
    try {
      const response = await fetch(`${API_URL}/${post.slug}/`);
      const data = await response.json();
      setSelectedPost(data);
      
      // Update the post in the list with new view count
      setBlogPosts(prev => prev.map(p => 
        p.id === post.id ? { ...p, views: data.views } : p
      ));
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Animal Health Blog
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Expert advice, tips, and insights to keep your pets healthy and happy
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 -mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {(searchTerm || selectedCategory !== 'All') && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')} className="hover:text-green-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => openPost(post)}
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-green-100">
                  <img
                    src={post.image || 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=500'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=500';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-blue-600 rounded-full text-xs font-semibold shadow-md">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {calculateReadTime(post.content)} min
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  {post.tags && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.split(',').slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                          <Tag className="h-2 w-2" />
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.views || 0}
                      </span>
                      <button
                        onClick={(e) => handleLikePost(post, e)}
                        disabled={likedPosts.has(post.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          likedPosts.has(post.id)
                            ? 'text-red-500 cursor-default'
                            : 'hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                        {post.likes || 0}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1 text-blue-600 font-semibold text-sm group">
                      Read More
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Article Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
              {/* Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {selectedPost.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(selectedPost.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {calculateReadTime(selectedPost.content)} min read
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {selectedPost.title}
                  </h1>

                  <p className="text-lg text-gray-600 mb-6">
                    {selectedPost.excerpt}
                  </p>

                  {selectedPost.tags && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedPost.tags.split(',').map((tag, index) => (
                        <span key={index} className="text-sm px-3 py-1 bg-gradient-to-r from-blue-50 to-green-50 text-gray-700 rounded-full flex items-center gap-1 border border-gray-200">
                          <Tag className="h-3 w-3" />
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {selectedPost.image && (
                  <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={selectedPost.image}
                      alt={selectedPost.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                <div className="prose prose-lg max-w-none mb-8">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedPost.content}
                  </div>
                </div>

                {/* Engagement Section */}
                <div className="border-t border-gray-200 pt-6 mt-8">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => handleLikePost(selectedPost, e)}
                        disabled={likedPosts.has(selectedPost.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all transform hover:scale-105 ${
                          likedPosts.has(selectedPost.id)
                            ? 'bg-red-100 text-red-600 cursor-default'
                            : 'bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 hover:text-red-700'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${likedPosts.has(selectedPost.id) ? 'fill-current' : ''}`} />
                        <span className="font-semibold">
                          {likedPosts.has(selectedPost.id) ? 'Liked' : 'Like'} ({selectedPost.likes || 0})
                        </span>
                      </button>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Eye className="h-5 w-5" />
                        <span className="font-semibold">{selectedPost.views || 0} Views</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleShare(selectedPost)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all transform hover:scale-105 shadow-md"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBlogPage;
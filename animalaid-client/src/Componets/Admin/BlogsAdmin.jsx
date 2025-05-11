import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MessageSquare, ThumbsUp, BarChart2, Search, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BlogsAdmin = () => {
  // State for blog posts
  const [blogPosts, setBlogPosts] = useState([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('posts');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    featuredImage: null,
    tags: []
  });

  // Mock data initialization
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        title: 'Understanding Mental Health in the Workplace',
        content: '<p>Mental health is a critical aspect of employee wellbeing...</p>',
        category: 'Workplace Wellness',
        featuredImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
        createdAt: '2023-05-15',
        likes: 42,
        comments: [
          { id: 1, user: 'John D.', text: 'This was really helpful!', date: '2023-05-16' },
          { id: 2, user: 'Sarah M.', text: 'We need more content like this', date: '2023-05-17' }
        ],
        views: 156
      },
      {
        id: 2,
        title: '5 Tips for Better Sleep Hygiene',
        content: '<p>Quality sleep is essential for productivity and mental health...</p>',
        category: 'Self Care',
        featuredImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597',
        createdAt: '2023-06-02',
        likes: 28,
        comments: [
          { id: 1, user: 'Alex P.', text: 'Implemented these and saw immediate results', date: '2023-06-03' }
        ],
        views: 98
      }
    ];
    setBlogPosts(mockPosts);
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle content change for rich text editor
  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content
    });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        featuredImage: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newPost = {
      id: Date.now(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      featuredImage: formData.featuredImage || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: [],
      views: 0
    };

    setBlogPosts([newPost, ...blogPosts]);
    resetForm();
    setIsCreatingPost(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: '',
      featuredImage: null,
      tags: []
    });
  };

  // Delete post
  const handleDeletePost = (id) => {
    setBlogPosts(blogPosts.filter(post => post.id !== id));
  };

  // Filter posts based on search term
  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Categories for dropdown
  const categories = [
    'Workplace Wellness',
    'Self Care',
    'Mental Health',
    'Productivity',
    'Relationships',
    'Nutrition'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Blog Management</h1>
            <p className="text-gray-600">Create and manage your blog content</p>
          </div>
          <button
            onClick={() => setIsCreatingPost((prev) => !prev)}
            className={`mt-4 md:mt-0 ${isCreatingPost ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white px-4 py-2 rounded-lg flex items-center gap-2`}
          >
            <Plus size={18} />
            {isCreatingPost ? 'Cancel' : 'Create New Post'}
          </button>

        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'posts' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('posts')}
          >
            Blog Posts
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'analytics' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'comments' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('comments')}
          >
            User Feedback
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search posts by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Create Post Form (shown when isCreatingPost is true) */}
        {isCreatingPost && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Blog Post</h2>
              <button
                onClick={() => {
                  setIsCreatingPost(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {formData.featuredImage && (
                    <div className="mt-2 w-full h-48 overflow-hidden rounded-md">
                      <img
                        src={formData.featuredImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={handleContentChange}
                    className="h-64 mb-12"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingPost(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Publish Post
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="text-gray-500 hover:text-indigo-600"
                        title="View details"
                      >
                        <MessageSquare size={18} />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-gray-500 hover:text-red-600"
                        title="Delete post"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full mb-2">
                    {post.category}
                  </span>
                  <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={14} />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      <span>{post.comments.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart2 size={14} />
                      <span>{post.views} views</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Blog Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-medium text-indigo-800">Total Posts</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{blogPosts.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800">Total Likes</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {blogPosts.reduce((sum, post) => sum + post.likes, 0)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-800">Total Comments</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {blogPosts.reduce((sum, post) => sum + post.comments.length, 0)}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="font-medium mb-2">Most Popular Posts</h3>
              <div className="space-y-2">
                {[...blogPosts]
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 3)
                  .map(post => (
                    <div key={post.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <span className="truncate">{post.title}</span>
                      <span className="text-sm text-gray-500">{post.views} views</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">User Feedback</h2>
            <div className="space-y-4">
              {blogPosts
                .filter(post => post.comments.length > 0)
                .flatMap(post =>
                  post.comments.map(comment => (
                    <div key={`${post.id}-${comment.id}`} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{comment.user}</p>
                          <p className="text-gray-500 text-sm">{comment.date}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                          {post.title}
                        </span>
                      </div>
                      <p className="mt-2">{comment.text}</p>
                    </div>
                  ))
                )}
            </div>
          </div>
        )}

        {/* Post Details Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Post Details</h2>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="h-64 overflow-hidden rounded-md mb-4">
                    <img
                      src={selectedPost.featuredImage}
                      alt={selectedPost.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{selectedPost.title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                      {selectedPost.category}
                    </span>
                    <span className="text-sm text-gray-500">Published on {selectedPost.createdAt}</span>
                  </div>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium mb-3">User Feedback ({selectedPost.comments.length})</h4>
                  {selectedPost.comments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPost.comments.map(comment => (
                        <div key={comment.id} className="border-l-4 border-indigo-200 pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">{comment.user}</p>
                            <span className="text-xs text-gray-500">{comment.date}</span>
                          </div>
                          <p className="mt-1">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No comments yet</p>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsAdmin;
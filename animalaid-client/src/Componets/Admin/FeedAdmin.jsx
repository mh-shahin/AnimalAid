import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';


const FeedAdmin = () => {
    const [formData, setFormData] = useState({
        name: '', brand: '', quantity: '', unit: '', animal_category: '', price: '', discount: '', feed_type: '', description: '', image: null
    });
    const [feeds, setFeeds] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const unitOptions = ['kg', 'packet', 'g', 'L', 'ml'];
    const animal_categoryOptions = ['Poultry', 'Cattle', 'Layer', 'Goat', 'Sheep', 'Cock', 'Duck'];
    const feed_typeOptions = ['Starter', 'Grower', 'Pellet', 'Finisher', 'Mash'];


    useEffect(() => {
        const fetchFeeds = async () => {
            try {
                const response = await fetch('http://localhost:8000/feeds/');
                if (!response.ok) throw new Error('Failed to fetch feeds');
                const data = await response.json();
                setFeeds(data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch feeds');
            }
        };
        fetchFeeds();
    }, []);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });



    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, image: e.target.files[0] });
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', formData.name);
    form.append('brand', formData.brand);
    form.append('quantity', formData.quantity);
    form.append('unit', formData.unit);
    form.append('animal_category', formData.animal_category);
    form.append('price', formData.price);
    form.append('discount', formData.discount);
    form.append('feed_type', formData.feed_type);
    form.append('description', formData.description);

    if (formData.image) {
        form.append('image', formData.image);
    }

    if (editingId) {
        form.append('id', editingId);
    }

    try {
        const response = await fetch('http://localhost:8000/feeds/', {
            method: editingId ? 'PUT' : 'POST',
            body: form,
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Backend validation error:', data);
            throw new Error('Failed to add/update feed');
        }

        if (editingId) {
            setFeeds(feeds.map(f => (f.id === editingId ? data : f)));
        } else {
            setFeeds([...feeds, data]);
        }

          Swal.fire({
            title: editingId ? 'Feed Updated!' : 'Feed Added!',
            text: `Feed "${formData.name}" has been ${editingId ? 'updated' : 'added'} successfully.`,
            icon: 'success',
            confirmButtonText: 'OK'
        });

        setIsFormVisible(false);
        setEditingId(null);
        setFormData({
            name: '',
            brand: '',
            quantity: '',
            unit: '',
            animal_category: '',
            price: '',
            discount: '',
            feed_type: '',
            description: '',
            image: null
        });

    } catch (error) {
        console.error('Error submitting feed', error);
        toast.error('Failed to add/update feed');
    }
};



    const handleEdit = (f) => {
        setFormData({
            name: f.name,
            brand: f.brand,
            quantity: f.quantity,
            unit: f.unit,
            animal_category: f.animal_category,
            price: f.price,
            discount: f.discount,
            feed_type: f.feed_type,
            description: f.description,
            image: null
        });
        setEditingId(f.id);
        setIsFormVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                const response = await fetch(`http://localhost:8000/feeds/?id=${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok && response.status !== 204) {
                    throw new Error('Delete failed');
                }

                setFeeds(prev => prev.filter(f => f.id !== id));
                toast.success(`✅ ${name} deleted successfully.`);
            } catch (error) {
                console.error('Error deleting feed:', error);
                toast.error(`❌ Failed to delete ${name}. Please try again.`);
            }
        }
    };


    const filteredFeeds = Array.isArray(feeds)
        ? feeds.filter((feed) =>
            feed.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feed.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feed.animal_category?.toLowerCase().includes(searchTerm.toLowerCase())
        ) : [];

    return (
        <div className="min-h-screen p-4 md:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Feed Administration</h1>
                    <button
                        onClick={() => {
                            setFormData({ name: '', brand: '', quantity: '', unit: '', animal_category: '', price: '', discount: '', feed_type: '', description: '', image: null });
                            setEditingId(null);
                            setIsFormVisible(!isFormVisible);
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                        {isFormVisible ? <X size={18} /> : <Plus size={18} />}
                        {isFormVisible ? 'Cancel' : 'Add Feed'}
                    </button>
                </header>

                {isFormVisible && (
                    <div className="mb-8 rounded-lg border border-gray-200 overflow-hidden bg-white shadow-md">
                        <div className="bg-indigo-600 p-4">
                            <h2 className="text-xl font-semibold text-white">{editingId ? 'Update Feed' : 'Add New Feed'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Feed Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter feed name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Brand</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        placeholder="Enter brand name"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        placeholder="Enter quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Select Unit</option>
                                        {unitOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Animal Category</label>
                                    <select
                                        name="animal_category"
                                        value={formData.animal_category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Select Animal</option>
                                        {animal_categoryOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Price <span className="font-extrabold">(৳)</span>*</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        placeholder="Enter price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                                    <input
                                        type="number"
                                        name="discount"
                                        placeholder="Enter discount percentage"
                                        value={formData.discount}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Feed Type</label>
                                    <select
                                        name="feed_type"
                                        value={formData.feed_type}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Select Type</option>
                                        {feed_typeOptions.map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        name="description"
                                        placeholder="Enter description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Image</label>
                                    <div className="flex items-center justify-between w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 transition duration-300">
                                        <label htmlFor="imageUpload" className="cursor-pointer text-indigo-600 hover:underline text-sm font-medium">
                                            Choose a file
                                        </label>
                                        <input
                                            id="imageUpload"
                                            type="file"
                                            name="image"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <span className="text-sm text-gray-500">JPG, PNG, JPEG</span>
                                    </div>

                                    {formData.image && (
                                        <p className="text-xs text-green-600 mt-1">✅ {formData.image.name} selected</p>
                                    )}

                                    <p className="text-xs text-gray-500 mt-2">
                                        📐 Recommended: 300x300px &nbsp; 📦 Max size: 2MB
                                    </p>
                                </div>

                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsFormVisible(false)}
                                    className="mr-4 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                                >
                                    {editingId ? 'Update Feed' : 'Add Feed'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 rounded-md">
                        <Search size={20} className="text-gray-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, brand, or animal_category"
                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none"
                        />
                    </div>
                </div>

                {filteredFeeds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm max-w-md mx-auto my-8">
                        <div className="text-gray-300 mb-4">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-800 mb-2">No matching feeds found</h3>
                        <p className="text-gray-500 text-base text-center">Try adjusting your search criteria or filters</p>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
                        {filteredFeeds.map((feed) => (
                            <div key={feed.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                                <div className="relative h-60 md:h-64">
                                    <img
                                        src={feed.image}
                                        alt={feed.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-3 right-3 bg-indigo-600 text-white text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                        {feed.animal_category}
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start gap-3 mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                                            {feed.name}
                                        </h3>
                                        <span className="bg-gray-100 text-gray-700 text-sm px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                                            {feed.quantity} {feed.unit}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                            {feed.brand}
                                        </span>
                                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                            {feed.feed_type}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4 leading-relaxed flex-grow line-clamp-1">
                                        {feed.description}
                                    </p>

                                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                                        <div>
                                            <p className="text-xl font-bold text-indigo-600"><span className="text-xl font-extrabold">৳</span>{feed.price}</p>
                                            {feed.discount && (
                                                <p className="text-sm font-medium text-green-600">
                                                    Save {feed.discount}% off
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(feed)}
                                                className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors duration-200"
                                                aria-label="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(feed.id)}
                                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200"
                                                aria-label="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredFeeds.length > 0 && (
                    <div className="mt-6 text-center text-gray-500 text-sm">
                        Showing {filteredFeeds.length} of {feeds.length} medicines
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedAdmin;
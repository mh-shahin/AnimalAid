import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, X, Image as ImageIcon } from 'lucide-react';

const FeedAdmin = () => {
    const [formData, setFormData] = useState({
        feedName: '', quantity: '', unit: '', animal: '', price: '', offer: '', brand: '', description: '', image: null
    });
    const [feeds, setFeeds] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);

    const unitOptions = ['kg', 'g', 'L', 'ml', 'packet', 'bale'];
    const animalOptions = ['Dog', 'Cat', 'Cow', 'Goat', 'Sheep', 'Hen', 'Duck'];

    useEffect(() => {
        const mockFeeds = [
            { id: 1, feedName: 'Dog Booster Feed', quantity: '5', unit: 'kg', animal: 'Dog', price: '12.50', offer: '5', brand: 'PetGrow', description: 'High-protein dog food', imageUrl: '/api/placeholder/100/100' },
            { id: 2, feedName: 'Hen Layer Feed', quantity: '10', unit: 'kg', animal: 'Hen', price: '8.75', offer: '10', brand: 'FarmFresh', description: 'Egg-laying hen feed', imageUrl: '/api/placeholder/100/100' }
        ];
        setFeeds(mockFeeds);
    }, []);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleImageChange = (e) => e.target.files && setFormData({ ...formData, image: e.target.files[0] });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            setFeeds(feeds.map(f => f.id === editingId ? { ...f, ...formData, imageUrl: '/api/placeholder/100/100' } : f));
            setEditingId(null);
        } else {
            setFeeds([...feeds, { ...formData, id: Date.now(), imageUrl: '/api/placeholder/100/100' }]);
        }
        setFormData({ feedName: '', quantity: '', unit: '', animal: '', price: '', offer: '', brand: '', description: '', image: null });
        setIsFormVisible(false);
    };

    const handleEdit = (f) => {
        setFormData({ feedName: f.feedName, quantity: f.quantity, unit: f.unit, animal: f.animal, price: f.price, offer: f.offer, brand: f.brand, description: f.description, image: null });
        setEditingId(f.id);
        setIsFormVisible(true);
    };

    const handleDelete = (id) => setFeeds(feeds.filter(f => f.id !== id));
    const filteredFeeds = feeds.filter(f => 
        f.feedName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.animal.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen p-4 md:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Feed Administration</h1>
                    <button 
                        onClick={() => { 
                            setFormData({ feedName: '', quantity: '', unit: '', animal: '', price: '', offer: '', brand: '', description: '', image: null }); 
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
                                        name="feedName" 
                                        placeholder="Enter feed name" 
                                        value={formData.feedName} 
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
                                    <label className="block text-sm font-medium text-gray-700">Animal</label>
                                    <select 
                                        name="animal" 
                                        value={formData.animal} 
                                        onChange={handleInputChange} 
                                        required 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Select Animal</option>
                                        {animalOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Price ($)</label>
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
                                        name="offer" 
                                        placeholder="Enter discount percentage" 
                                        value={formData.offer} 
                                        onChange={handleInputChange} 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                                    />
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
                                    <div className="flex items-center">
                                        <label className="cursor-pointer flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
                                            <ImageIcon size={18} className="mr-2" />
                                            <span>Choose file</span>
                                            <input 
                                                type="file" 
                                                name="image" 
                                                onChange={handleImageChange} 
                                                accept="image/*" 
                                                className="hidden" 
                                            />
                                        </label>
                                        <span className="ml-3 text-sm text-gray-500">
                                            {formData.image ? formData.image.name : 'No file chosen'}
                                        </span>
                                    </div>
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
                            placeholder="Search by name, brand, or animal" 
                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none"
                        />
                    </div>
                </div>

                {filteredFeeds.length === 0 ? (
                    <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
                        <p className="text-gray-500">No feeds found matching your search criteria.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredFeeds.map((feed) => (
                            <div key={feed.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="relative">
                                    <img 
                                        src={feed.imageUrl} 
                                        alt={feed.feedName} 
                                        className="w-full h-48 object-cover" 
                                    />
                                    <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
                                        {feed.animal}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{feed.feedName}</h3>
                                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                            {feed.quantity} {feed.unit}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{feed.brand}</p>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{feed.description}</p>
                                    
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-lg font-bold text-indigo-600">${feed.price}</p>
                                            {feed.offer && (
                                                <p className="text-xs text-green-600">Save {feed.offer}% off</p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => handleEdit(feed)} 
                                                className="p-2 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                                aria-label="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(feed.id)} 
                                                className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                                                aria-label="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedAdmin;
import React, { useEffect, useState } from 'react';
import { Filter, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../../Shared/ProductCard/ProductFeedCard';

const Feed = () => {
    const [feeds, setFeeds] = useState([]);
    const [groupedFeeds, setGroupedFeeds] = useState({});
    const [filteredFeeds, setFilteredFeeds] = useState({});
    const [showFilter, setShowFilter] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    useEffect(() => {
        const fetchFeeds = async () => {
            try {
                const res = await fetch('http://localhost:8000/feeds/');
                const data = await res.json();
                setFeeds(data);

                const grouped = {};
                data.forEach((feed) => {
                    const cat = feed.animal_category?.trim() || "Uncategorized";
                    if (!grouped[cat]) {
                        grouped[cat] = [];
                    }
                    grouped[cat].push(feed);
                });

                setGroupedFeeds(grouped);
                setFilteredFeeds(grouped);
            } catch (err) {
                console.error("Error fetching feeds:", err);
            }
        };

        fetchFeeds();
    }, []);

    useEffect(() => {
        let filtered = { ...groupedFeeds };

        if (selectedCategories.length > 0) {
            filtered = Object.keys(filtered)
                .filter(cat => selectedCategories.includes(cat))
                .reduce((obj, key) => {
                    obj[key] = filtered[key];
                    return obj;
                }, {});
        }

        if (priceRange.min !== '' || priceRange.max !== '') {
            const min = priceRange.min === '' ? 0 : parseFloat(priceRange.min);
            const max = priceRange.max === '' ? Infinity : parseFloat(priceRange.max);
            
            filtered = Object.keys(filtered).reduce((obj, cat) => {
                const filteredProducts = filtered[cat].filter(feed => {
                    const price = parseFloat(feed.price);
                    return price >= min && price <= max;
                });
                if (filteredProducts.length > 0) {
                    obj[cat] = filteredProducts;
                }
                return obj;
            }, {});
        }

        setFilteredFeeds(filtered);
    }, [selectedCategories, priceRange, groupedFeeds]);

    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setPriceRange({ min: '', max: '' });
    };

    const activeFiltersCount = selectedCategories.length + 
        (priceRange.min || priceRange.max ? 1 : 0);

    const totalProducts = Object.values(filteredFeeds).reduce((sum, products) => sum + products.length, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-3">Animal Feeds</h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Quality nutrition for your animals' health and growth
                        </p>
                        <div className="mt-4 text-lg">
                            <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                {totalProducts} Products Available
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white shadow-lg -mt-6 mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto rounded-xl">
                <div className="p-6">
                    <div className="flex items-center justify-end gap-3">
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="px-4 py-3 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg font-medium transition whitespace-nowrap"
                            >
                                Clear all
                            </button>
                        )}
                        <button
                            onClick={() => setShowFilter(!showFilter)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all font-medium shadow-md whitespace-nowrap"
                        >
                            <Filter size={18} />
                            <span>Filters</span>
                            {activeFiltersCount > 0 && (
                                <span className="ml-1 px-2.5 py-0.5 bg-white text-blue-600 text-xs font-bold rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Active Filters */}
                    {(selectedCategories.length > 0 || priceRange.min || priceRange.max) && (
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                            {selectedCategories.map(cat => (
                                <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                    {cat}
                                    <button onClick={() => handleCategoryToggle(cat)} className="hover:text-green-900">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                            {(priceRange.min || priceRange.max) && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                    Price: {priceRange.min || '0'} - {priceRange.max || '∞'}
                                    <button onClick={() => setPriceRange({ min: '', max: '' })} className="hover:text-purple-900">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Sidebar Modal */}
            {showFilter && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        onClick={() => setShowFilter(false)}
                    ></div>
                    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                                <button
                                    onClick={() => setShowFilter(false)}
                                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Animal Categories */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                                    Animal Categories
                                </h4>
                                <div className="space-y-2.5 max-h-80 overflow-y-auto">
                                    {Object.keys(groupedFeeds).map(category => (
                                        <label key={category} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(category)}
                                                onChange={() => handleCategoryToggle(category)}
                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                                                {category}
                                            </span>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                                {groupedFeeds[category].length}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="pt-6 border-t border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <div className="w-1 h-5 bg-green-600 rounded-full"></div>
                                    Price Range
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Minimum Price</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Maximum Price</label>
                                        <input
                                            type="number"
                                            placeholder="No limit"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Apply Button */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowFilter(false)}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-lg font-semibold transition-all shadow-md"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Products Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Products Grid */}
                {Object.keys(filteredFeeds).length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No feeds found</h3>
                        <p className="text-gray-600 mb-6">Try adjusting your filters</p>
                        <button
                            onClick={clearAllFilters}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-lg transition-all font-semibold shadow-md"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    Object.keys(filteredFeeds).map((category) => (
                        <div key={category} className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {filteredFeeds[category].length} {filteredFeeds[category].length === 1 ? 'product' : 'products'} available
                                    </p>
                                </div>
                                {groupedFeeds[category] && groupedFeeds[category].length > 5 && (
                                    <Link
                                        to={`/feed/category/${encodeURIComponent(category)}`}
                                        className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-blue-600 hover:text-white hover:bg-blue-600 border-2 border-blue-600 rounded-lg transition-all"
                                    >
                                        View All
                                        <ChevronRight size={16} />
                                    </Link>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                {filteredFeeds[category].slice(0, 5).map((product) => (
                                    <ProductCard key={product.id} product={product} type="feed" />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Feed;
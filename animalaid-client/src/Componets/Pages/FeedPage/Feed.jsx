import React from 'react';
import { Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import feedImage from '../../Images/feed.jpg'; // Replace with your actual feed image

const Feed = () => {
    const feedCategories = [
        { id: 1, name: 'Starter Feed', icon: '🐥' },
        { id: 2, name: 'Grower Feed', icon: '🐔' },
        { id: 3, name: 'Layer Feed', icon: '🥚' },
        { id: 4, name: 'Broiler Feed', icon: '🍗' },
        { id: 5, name: 'Finisher Feed', icon: '🌾' },
    ];

    const productCategories = [
        {
            category: 'Popular Poultry Feed',
            products: [
                { id: 1, name: 'Starter Mix', price: 20.99, image: feedImage },
                { id: 2, name: 'Grower Crumble', price: 22.50, image: feedImage },
                { id: 3, name: 'Layer Pellets', price: 25.99, image: feedImage },
                { id: 4, name: 'Broiler Boost', price: 27.49, image: feedImage },
                { id: 5, name: 'Finisher Formula', price: 30.00, image: feedImage },
                { id: 6, name: 'Protein Plus Feed', price: 32.99, image: feedImage },
            ],
        },
        {
            category: 'Organic Feed',
            products: [
                { id: 7, name: 'Natural Starter', price: 24.99, image: feedImage },
                { id: 8, name: 'Herbal Grower', price: 28.00, image: feedImage },
                { id: 9, name: 'Eco Layer Pellets', price: 29.99, image: feedImage },
                { id: 10, name: 'Bio Finisher', price: 35.00, image: feedImage },
            ],
        },
    ];

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="bg-white p-4 shadow-md">
                <h1 className="text-2xl font-bold text-blue-700">Animal Feed</h1>
            </div>

            <div className="bg-white p-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center">
                    <Filter size={18} className="text-gray-500 mr-2" />
                    <span className="text-gray-700">Filter</span>
                </div>
                <div className="flex items-center">
                    <span className="text-gray-700 mr-2">Sort by: Popularity</span>
                    <ChevronDown size={18} className="text-gray-500" />
                </div>
            </div>

            <div className="p-4">
                <div className="w-full h-[380px] bg-blue-100 flex items-center justify-center rounded-lg overflow-hidden">
                    <img src={feedImage} alt="Feed promotion banner" className="w-full h-[500px] object-fill" />
                </div>
            </div>

            <div className="px-4 mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-800">Categories</h2>
                <div className="grid grid-cols-5 gap-2">
                    {feedCategories.map((category) => (
                        <div
                            key={category.id}
                            className="bg-white p-2 rounded-lg shadow-sm flex flex-col items-center"
                        >
                            <div className="text-2xl mb-1">{category.icon}</div>
                            <span className="text-xs text-center font-medium text-gray-700">
                                {category.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {productCategories.map((category) => (
                <div key={category.category} className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800">{category.category}</h2>
                        <Link
                            to={`/feed/category/${encodeURIComponent(category.category)}`}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Only show first 5 products */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {category.products.slice(0, 5).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const ProductCard = ({ product }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-contain p-4"
                />
                <div className="absolute top-2 right-2">
                    <button className="p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400 hover:text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="p-4 border-t border-gray-200">
                <h3 className="font-semibold text-sm text-gray-800 mb-1 truncate">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between">
                    <p className="font-bold text-blue-600">${product.price.toFixed(2)}</p>
                    <button className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md hover:bg-blue-700 transition-colors">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Feed;

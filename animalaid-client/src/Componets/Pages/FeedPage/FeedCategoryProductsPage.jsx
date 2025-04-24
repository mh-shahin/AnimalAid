import React from 'react';
import { useParams } from 'react-router-dom';
import feedImage from '../../Images/feed.jpg'; // Use your actual feed image

const feedCategoriesData = {
  'Popular Poultry Feed': [
    { id: 1, name: 'Starter Mix', price: 20.99, image: feedImage },
    { id: 2, name: 'Grower Crumble', price: 22.50, image: feedImage },
    { id: 3, name: 'Layer Pellets', price: 25.99, image: feedImage },
    { id: 4, name: 'Broiler Boost', price: 27.49, image: feedImage },
    { id: 5, name: 'Finisher Formula', price: 30.00, image: feedImage },
    { id: 6, name: 'Protein Plus Feed', price: 32.99, image: feedImage },
  ],
  'Organic Feed': [
    { id: 7, name: 'Natural Starter', price: 24.99, image: feedImage },
    { id: 8, name: 'Herbal Grower', price: 28.00, image: feedImage },
    { id: 9, name: 'Eco Layer Pellets', price: 29.99, image: feedImage },
    { id: 10, name: 'Bio Finisher', price: 35.00, image: feedImage },
  ],
};

const FeedCategoryProductsPage = () => {
  const { categoryName } = useParams();
  const decodedCategoryName = decodeURIComponent(categoryName);
  const products = feedCategoriesData[decodedCategoryName] || [];

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        {decodedCategoryName}
      </h1>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No products found for this category.</p>
      )}
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

export default FeedCategoryProductsPage;

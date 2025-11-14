import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../Context/CartContext.jsx';
import { CheckCircle } from 'lucide-react';

const fallbackImage = '/fallback-medicine.jpg'; // optional fallback if image fails

const ProductCard = ({ product, type = 'medicin' }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [added, setAdded] = useState(false);
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const handleImageLoad = () => setImageLoading(false);
    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
    };

    const handleAddToCart = () => {
        addToCart(product, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-4 border border-gray-200 transform hover:-translate-y-1">
            <div className="relative h-48 flex justify-center items-center bg-gray-50 rounded-lg overflow-hidden">
                {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}
                <img
                    src={imageError ? fallbackImage : product.image}
                    alt={product.name}
                    className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{ display: imageLoading ? 'none' : 'block' }}
                />
            </div>
            <div className="absolute top-3 left-3 bg-green-600 text-white text-sm font-normal px-3 py-1 rounded-full shadow-sm">
                In stock {product.piece}
            </div>

            <div className="mt-4">
                <h3 className="text-lg text-center font-semibold text-gray-800 line-clamp-2 mb-1">
                    {product.name}
                </h3>

                {product.quantity && (
                    <p className="text-sm font-semibold text-gray-500 mb-2">
                        Size: {product.quantity} {product.unit}
                    </p>
                )}

                {product.brand && (
                    <p className="text-sm font-semibold text-gray-500 mb-2">
                        {product.brand}
                    </p>
                )}

                <div className="flex items-center justify-between mt-3">
                    <p className="text-blue-600 font-bold text-lg">
                        ৳{parseFloat(product.price).toFixed(2)}
                    </p>
                    {product.discount && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            -{product.discount}%
                        </span>
                    )}
                </div>

                <div className="mt-4 flex gap-2">
                    <button onClick={handleAddToCart} className={`flex-1 text-xs py-2 px-3 rounded-md transition-colors font-medium ${added ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                        {added ? <span className="flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4" /> Added</span> : "Add to Cart"}
                    </button>
                    <Link
                        to={`/${type}/${product.id}`}
                        className="flex-1 border border-blue-600 text-blue-600 text-xs text-center py-2 px-3 rounded-md hover:bg-blue-50 transition-colors font-medium"
                    >
                        Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
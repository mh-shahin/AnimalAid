import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../Context/CartContext.jsx';
import { CheckCircle } from 'lucide-react';

const fallbackImage = '/fallback-medicine.jpg';

const ProductFeedCard = ({ product, type = 'feed' }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [added, setAdded] = useState(false);
    const [stockError, setStockError] = useState('');
    const navigate = useNavigate();
    const { addToCart, cartItems } = useCart();

    // Check stock availability
    const isOutOfStock = !product.piece || product.piece <= 0;

    // Get current quantity in cart
    const getCartQuantity = () => {
        const cartItem = cartItems.find(item => item.id === product.id);
        return cartItem ? cartItem.quantity : 0;
    };

    const handleImageLoad = () => setImageLoading(false);
    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
    };

    const handleAddToCart = () => {

        // Check if out of stock
        if (isOutOfStock) {
            setStockError('This product is currently out of stock!');
            setTimeout(() => setStockError(''), 3000);
            return;
        }
        // Check if adding more would exceed available stock
        const currentCartQty = getCartQuantity();
        if (currentCartQty >= product.piece) {
            setStockError(`Maximum available stock is ${product.piece} units!`);
            setTimeout(() => setStockError(''), 3000);
            return;
        }
        // ✅ FIX: Add product_type to the product object before adding to cart
        const productWithType = {
            ...product,
            product_type: 'feed', // Explicitly set as feed
            type: 'feed', // Add both for compatibility
            maxStock: product.piece
        };

        addToCart(productWithType, 1);
        setAdded(true);
        setStockError('');
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

            <div className={`absolute top-3 left-3 text-white text-sm font-normal px-3 py-1 rounded-full shadow-sm ${isOutOfStock ? 'bg-red-600' : 'bg-green-600'
                }`}>
                {isOutOfStock ? 'Out of Stock' : `In stock ${product.piece}`}
            </div>
            {stockError && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 text-xs font-medium px-3 py-1 rounded-md shadow-sm">
                    {stockError}
                </div>
            )}

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
                    <button
                        onClick={handleAddToCart}
                        disabled={added || isOutOfStock}
                        className={`flex-1 text-xs py-2 px-3 rounded-md transition-colors font-medium ${added || isOutOfStock
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
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

export default ProductFeedCard;
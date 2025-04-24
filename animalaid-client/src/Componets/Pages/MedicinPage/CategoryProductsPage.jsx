import React from 'react';
import { useParams } from 'react-router-dom';
import medicin  from '../../Images/medicin.jpeg';

const allProductCategories = [
    {
        category: "Popular Medicines",
        products: [
            { id: 1, name: 'Paracetamol', price: 5.99, category: 'Pain Relief', image: medicin },
            { id: 2, name: 'Ibuprofen', price: 6.99, category: 'Pain Relief', image: medicin },
            { id: 3, name: 'Cold Syrup', price: 8.49, category: 'Cold & Flu', image: medicin },
            { id: 4, name: 'Vitamin C', price: 12.99, category: 'Vitamins', image: medicin },
            { id: 5, name: 'Bandages', price: 3.99, category: 'First Aid', image: medicin },
            { id: 6, name: 'Aspirin', price: 4.99, category: 'Pain Relief', image: medicin },
        ],
    },
    {
        category: "Farm Essentials",
        products: [
            { id: 11, name: 'Livestock Supplement', price: 39.99, image: medicin },
            { id: 12, name: 'Poultry Feed Plus', price: 32.99, image: medicin },
            { id: 13, name: 'Farm Animal Vaccines', price: 45.99, image: medicin },
            { id: 14, name: 'Hoof Health Solution', price: 18.99, image: medicin },
            { id: 15, name: 'Farm Animal Vitamins', price: 22.99, image: medicin },
        ],
    },
];

const CategoryProductsPage = () => {
    const { categoryName } = useParams();
    const decodedCategory = decodeURIComponent(categoryName);

    const category = allProductCategories.find(
        (cat) => cat.category === decodedCategory
    );

    if (!category) return <p className="p-4 text-red-500">Category not found</p>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {category.category}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {category.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
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

export default CategoryProductsPage;

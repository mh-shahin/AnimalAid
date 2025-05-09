import React, { useState, useEffect } from "react";
import { data, Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, Pill, Leaf, UserPlus, ShoppingBag } from "lucide-react";
import poultry from '../../Images/Poultry.jpg';
import fish from '../../Images/Fish.jpg';
import cow from '../../Images/mokbuls-cattle-farm.avif';
import duck from '../../Images/duckfarm.jpg';
import medicin from '../../Images/medicin.jpeg';
import equepment from '../../Images/equiepment.webp';
import consultant from '../../Images/consultant.webp';
import feed from '../../Images/feed.jpg';
import { use } from "react";




// Mock data for carousel
const carouselData = [
    {
        id: 1,
        image: poultry,
        title: "Emergency Pet Services",
        description: "24/7 care for your beloved animals",
        buttonText: "Learn More"
    },
    {
        id: 2,
        image: fish,
        title: "Quality Animal Food",
        description: "Premium nutrition for all types of animals",
        buttonText: "Shop Now"
    },
    {
        id: 3,
        image: cow,
        title: "Animal Medicine Delivery",
        description: "Fast delivery for all your pet's healthcare needs",
        buttonText: "Order Now"
    },
    {
        id: 4,
        image: duck,
        title: "Veterinary Consultations",
        description: "Expert veterinary care for your furry friends",
        buttonText: "Book Appointment"
    }
];

// Mock product data
const productCategories = [
    {
        category: "Medicines",
        products: [
            { id: 1, name: "VetriScience GlycoFlex", price: 29.99, image: medicin },
            { id: 2, name: "PetWell Antibiotics", price: 19.99, image: medicin },
            { id: 3, name: "NutriVet Ear Cleaner", price: 12.99, image: medicin },
            { id: 4, name: "Animal Pain Relief", price: 24.99, image: medicin },
            { id: 5, name: "VetriScience GlycoFlex", price: 34.99, image: medicin },
        ]
    },
    {
        category: "Farm Essentials",
        products: [
            { id: 6, name: "Livestock Supplement", price: 39.99, image: equepment },
            { id: 7, name: "Poultry Feed Plus", price: 32.99, image: equepment },
            { id: 8, name: "Farm Animal Vaccines", price: 45.99, image: equepment },
            { id: 9, name: "Hoof Health Solution", price: 18.99, image: equepment },
            { id: 10, name: "Farm Animal Vitamins", price: 22.99, image: equepment },
        ]
    }
];

const HomePage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [items, setItems] = useState([]);

    useEffect(() => {
        // Fetch data from the Django backend
        const fetchItems = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/animals/');
                if (!response.ok) {
                    throw new Error('Failed to fetch items');
                }
                const data = await response.json();
                setItems(data); // Set the data into state
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchItems();
    }, []);
    // console.log(items);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === carouselData.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? carouselData.length - 1 : prev - 1));
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-5">
            {/* Carousel */}
            <div className="relative rounded-lg overflow-hidden shadow-md">
                <div className="relative h-[380px]">
                    {carouselData.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`transition-opacity duration-500 ${index === currentSlide ? "opacity-100" : "opacity-0 absolute inset-0"
                                }`}
                        >
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-[380px] object-cover "
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-8">
                                <h2 className="text-white text-2xl font-bold mb-2">{slide.title}</h2>
                                <p className="text-white text-sm mb-4 max-w-md">{slide.description}</p>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-md w-max text-sm font-medium hover:bg-blue-700 transition-colors">
                                    {slide.buttonText}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Carousel Controls */}
                <button
                    onClick={prevSlide}
                    className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 backdrop-blur-sm transition-colors"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 backdrop-blur-sm transition-colors"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-5 h-5 text-white" />
                </button>

                {/* Carousel Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {carouselData.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/50"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Featured Categories Section */}
            <div className="mt-8 grid grid-cols-3 gap-5">
                <FeaturedCategory
                    title="medicin"
                    image={medicin}
                    color="bg-red-100"
                    icon={<Pill className="w-6 h-6 text-red-500" />}
                />
                <FeaturedCategory
                    title="feed"
                    image={feed}
                    color="bg-amber-100"
                    icon={<ShoppingBag className="w-6 h-6 text-amber-500" />}
                />
                <FeaturedCategory
                    title="consultations"
                    image={consultant}
                    color="bg-blue-100"
                    icon={<UserPlus className="w-6 h-6 text-blue-500" />}
                />
            </div>

            {/* Products by Category */}
            {productCategories.map((category) => (
                <div key={category.category} className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800">{category.category}</h2>
                        <Link to="/medicin" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 h-[350px]">
                        {category.products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            ))}
            <div>
                <h2><span className="text-2xl font-bold text-gray-800">All Products: {items.length}</span> {items.map(item => (
                    <p key={item.id}><div className=" font-bold text-green-500">
                        {item.name}
                    </div></p>
                ))}
                </h2>
            </div>
        </div>
    );
};



// Featured Category Component
const FeaturedCategory = ({ title, image, color, icon }) => {
    const formattedTitle = title.toLowerCase().replace(/\s+/g, "-");
    return (
        <Link to={`/${formattedTitle}`} className="block">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                    <div className={`absolute top-0 right-0 m-2 ${color} p-2 rounded-full`}>
                        {icon}
                    </div>
                </div>
                <div className="p-3 border-t border-gray-100">
                    <h3 className="font-medium text-sm text-gray-800">{title}</h3>
                    <p className="text-xs text-gray-500 mt-1">Explore Products</p>
                </div>
            </div>
        </Link>
    );
};

// Product Card Component
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="p-4 border-t border-gray-200">
                <h3 className="font-semibold text-sm text-gray-800 mb-1 truncate">{product.name}</h3>
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

export default HomePage;
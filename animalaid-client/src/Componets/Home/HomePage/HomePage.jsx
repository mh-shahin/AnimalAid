import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, Pill, Leaf, UserPlus} from "lucide-react";
import poultry from "../../Images/Poultry.jpg";
import fish from "../../Images/Fish.jpg";
import cow from "../../Images/mokbuls-cattle-farm.avif";
import duck from "../../Images/duckfarm.jpg";
import medicin from "../../Images/medicin.jpeg";
import consultant from "../../Images/consultant.webp";
import feed from "../../Images/feed.jpg";

// ✅ import your reusable product card components
import ProductCard from "../../Shared/ProductCard/ProductCard.jsx";
import ProductFeedCard from "../../Shared/ProductCard/ProductFeedCard.jsx";

const carouselData = [
    {
        id: 1,
        image: poultry,
        title: "Emergency Pet Services",
        description: "24/7 care for your beloved animals",
        buttonText: "Learn More",
    },
    {
        id: 2,
        image: fish,
        title: "Quality Animal Food",
        description: "Premium nutrition for all types of animals",
        buttonText: "Shop Now",
    },
    {
        id: 3,
        image: cow,
        title: "Animal Medicine Delivery",
        description: "Fast delivery for all your pet's healthcare needs",
        buttonText: "Order Now",
    },
    {
        id: 4,
        image: duck,
        title: "Veterinary Consultations",
        description: "Expert veterinary care for your furry friends",
        buttonText: "Book Appointment",
    },
];

const HomePage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [medicines, setMedicines] = useState([]);
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Auto carousel rotation
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) =>
                prev === carouselData.length - 1 ? 0 : prev + 1
            );
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Fetch medicines and feeds
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [medicineRes, feedRes] = await Promise.all([
                    fetch("http://127.0.0.1:8000/medicines/"),
                    fetch("http://127.0.0.1:8000/feeds/"),
                ]);

                if (!medicineRes.ok || !feedRes.ok) {
                    throw new Error("Failed to fetch products");
                }

                const [medicineData, feedData] = await Promise.all([
                    medicineRes.json(),
                    feedRes.json(),
                ]);

                setMedicines(medicineData);
                setFeeds(feedData);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const nextSlide = () =>
        setCurrentSlide((prev) =>
            prev === carouselData.length - 1 ? 0 : prev + 1
        );

    const prevSlide = () =>
        setCurrentSlide((prev) =>
            prev === 0 ? carouselData.length - 1 : prev - 1
        );

    const displayedMedicines = medicines.slice(0, 10);
    const displayedFeeds = feeds.slice(0, 10);

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen pt-5 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pt-5">
            {/* === Carousel === */}
            <div className="relative rounded-lg overflow-hidden shadow-md max-w-7xl mx-auto">
                <div className="relative h-[380px]">
                    {carouselData.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`transition-opacity duration-500 ${index === currentSlide
                                ? "opacity-100"
                                : "opacity-0 absolute inset-0"
                                }`}
                        >
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-[380px] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-8">
                                <h2 className="text-white text-3xl font-bold mb-3">
                                    {slide.title}
                                </h2>
                                <p className="text-white text-lg mb-6 max-w-md">
                                    {slide.description}
                                </p>
                                <button className="bg-blue-600 text-white px-6 py-3 rounded-md w-max text-sm font-medium hover:bg-blue-700 transition-colors transform hover:scale-105">
                                    {slide.buttonText}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <button
                    onClick={prevSlide}
                    className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 backdrop-blur-sm transition-all transform hover:scale-110"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 backdrop-blur-sm transition-all transform hover:scale-110"
                >
                    <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {carouselData.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${index === currentSlide
                                ? "bg-white scale-125"
                                : "bg-white/50"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* === Featured Categories === */}
            <div className="max-w-7xl mx-auto px-4 mt-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeaturedCategory
                        title="Medicin"
                        image={medicin}
                        color="bg-red-100"
                        icon={<Pill className="w-6 h-6 text-red-500" />}
                    />
                    <FeaturedCategory
                        title="Feed"
                        image={feed}
                        color="bg-green-100"
                        icon={<Leaf className="w-6 h-6 text-green-500" />}
                    />
                    <FeaturedCategory
                        title="Consultations"
                        image={consultant}
                        color="bg-blue-100"
                        icon={<UserPlus className="w-6 h-6 text-blue-500" />}
                    />
                </div>
            </div>

            {/* === Error === */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        Error: {error}
                    </div>
                </div>
            )}

            {/* === Medicines Section === */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Medicines
                    </h2>
                    <Link
                        to="/medicin"
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                    >
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {displayedMedicines.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>

            {/* === Feeds Section === */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Animal Feed</h2>
                    <Link
                        to="/feed"
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                    >
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {displayedFeeds.map((feed) => (
                        <ProductFeedCard key={feed.id} product={feed} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// === Featured Category Card ===
const FeaturedCategory = ({ title, image, color, icon }) => {
    const formattedTitle = title.toLowerCase().replace(/\s+/g, "-");
    return (
        <Link to={`/${formattedTitle}`} className="block group">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-2">
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className={`absolute top-4 right-4 ${color} p-3 rounded-full shadow-lg`}>
                        {icon}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">{title}</h3>
                    <p className="text-sm text-gray-600">Explore our {title.toLowerCase()} collection</p>
                </div>
            </div>
        </Link>
    );
};

export default HomePage;

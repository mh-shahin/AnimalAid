import React, { useEffect, useState } from 'react';
import { Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../../Shared/ProductCard/ProductFeedCard'; // adjust if different

const Feed = () => {
    const [feeds, setFeeds] = useState([]);
    const [groupedFeeds, setGroupedFeeds] = useState({});

    useEffect(() => {
        const fetchFeeds = async () => {
            try {
                const res = await fetch('http://localhost:8000/feeds/');
                const data = await res.json();
                setFeeds(data);

                // Group feeds by animal_category
                const grouped = {};
                data.forEach((feed) => {
                    const cat = feed.animal_category?.trim() || "Uncategorized";
                    if (!grouped[cat]) {
                        grouped[cat] = [];
                    }
                    grouped[cat].push(feed);
                });

                setGroupedFeeds(grouped);
            } catch (err) {
                console.error("Error fetching feeds:", err);
            }
        };

        fetchFeeds();
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="bg-white p-4 shadow-md">
                <h1 className="text-2xl font-bold text-blue-700">Feeds</h1>
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

            <div className="px-4 mt-6">
                {Object.keys(groupedFeeds).map((animal_category) => (
                    <div key={animal_category} className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">{animal_category}</h2>
                            {groupedFeeds[animal_category].length > 5 && (
                                <Link
                                    to={`/feed/category/${encodeURIComponent(animal_category)}`}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {groupedFeeds[animal_category].slice(0, 5).map((product) => (
                                <ProductCard key={product.id} product={product} type="feed" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feed;

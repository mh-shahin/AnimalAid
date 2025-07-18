import React, { useEffect, useState } from 'react';
import { Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../../Shared/ProductCard/ProductCard';

const Medicin = () => {
    const [medicines, setMedicines] = useState([]);
    const [groupedMedicines, setGroupedMedicines] = useState({});

    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/medicines/');
                const data = await res.json();
                setMedicines(data);

                // Group medicines by category
                const grouped = {};
                data.forEach((medicine) => {
                    const cat = medicine.category || "Uncategorized";
                    if (!grouped[cat]) {
                        grouped[cat] = [];
                    }
                    grouped[cat].push(medicine);
                });

                setGroupedMedicines(grouped);
            } catch (err) {
                console.error("Error fetching medicines:", err);
            }
        };

        fetchMedicines();
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="bg-white p-4 shadow-md">
                <h1 className="text-2xl font-bold text-blue-700">Medicine</h1>
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

            {/* Display category-wise */}
            <div className="px-4 mt-6">
                {Object.keys(groupedMedicines).map((category) => (
                    <div key={category} className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">{category}</h2>
                            {groupedMedicines[category].length > 5 && (
                                <Link
                                    to={`/medicin/category/${encodeURIComponent(category)}`}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            )}

                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {groupedMedicines[category].slice(0, 5).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Medicin;

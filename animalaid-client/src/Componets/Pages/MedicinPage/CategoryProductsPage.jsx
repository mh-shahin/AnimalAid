// src/Pages/CategoryProductPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../../Shared/ProductCard/ProductCard'; // adjust path as needed

const CategoryProductPage = () => {
  const { categoryName } = useParams();
  const [allMedicines, setAllMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/medicines/');
        const data = await response.json();
        setAllMedicines(data);

        // Filter by category
        const filtered = data.filter(
          (item) => item.category?.toLowerCase() === categoryName?.toLowerCase()
        );
        setFilteredMedicines(filtered);
      } catch (err) {
        console.error('Error fetching medicines:', err);
      }
    };

    fetchMedicines();
  }, [categoryName]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        Category: {categoryName}
      </h1>

      {filteredMedicines.length === 0 ? (
        <p className="text-gray-500">No medicines found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredMedicines.map((medicine) => (
            <ProductCard key={medicine.id} product={medicine} type="medicin" />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryProductPage;

// src/Pages/FeedCategoryProductsPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../../Shared/ProductCard/ProductFeedCard'; // adjust path as needed

const FeedCategoryProductsPage = () => {
  const { categoryName } = useParams();
  const [allFeeds, setAllFeeds] = useState([]);
  const [filteredFeeds, setFilteredFeeds] = useState([]);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const response = await fetch('http://localhost:8000/feeds/');
        const data = await response.json();
        setAllFeeds(data);

        // Filter feeds by category
        const filtered = data.filter(
          (item) =>
            item.animal_category?.toLowerCase().trim() === categoryName?.toLowerCase().trim()
        );
        setFilteredFeeds(filtered);
      } catch (err) {
        console.error('Error fetching feeds:', err);
      }
    };

    fetchFeeds();
  }, [categoryName]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        Category: {categoryName}
      </h1>

      {filteredFeeds.length === 0 ? (
        <p className="text-gray-500">No feed products found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredFeeds.map((feed) => (
            <ProductCard key={feed.id} product={feed} type="feed" />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedCategoryProductsPage;

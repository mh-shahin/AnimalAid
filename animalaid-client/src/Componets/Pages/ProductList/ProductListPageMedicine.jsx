import React, { useEffect, useState } from "react";
import ProductCard from "../../Shared/ProductCard/ProductCard.jsx";

const ProductListPageMedicine = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Replace this URL with your real API endpoint
  const API_URL = "http://127.0.0.1:8000/medicines"; 
  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Network response not ok");
        const data = await res.json();
        if (mounted) setProducts(data);
      } catch (err) {
        console.warn("Product fetch failed, using mock data:", err);
        if (mounted) {
          setProducts([
            { id: "p1", name: "Dairy Boost Feed", image: "/feed1.jpg", price: 350, brand: "GreenFarm", piece: 15, quantity: 5, unit: "kg" },
            { id: "p2", name: "Cattle Vitamin Mix", image: "/med1.jpg", price: 200, brand: "VetLine", piece: 10 },
            // add more mock items as needed
          ]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className="text-center mt-24">Loading products...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
};

export default ProductListPageMedicine;

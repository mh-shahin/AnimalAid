import React from "react";
import { useCart } from "../../../Context/CartContext.jsx";
import { Trash, Minus, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const navigate = useNavigate();

  if (!cartItems.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-inner">

        <h2 className="text-3xl font-bold text-gray-800 mb-8 tracking-wide">
          Your Cart is Empty
        </h2>
        {/* Floating Animation Cart Icon */}
        <div className="p-6 bg-white shadow-lg rounded-full relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-28 w-28 text-blue-500 animate-bounce-slow"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437m0 0h14.007c.78 
            0 1.318.78 1.08 1.518l-1.602 4.807a1.125 
            1.125 0 01-1.08.757H7.527m-2.421-6.082L7.527 
            12.75m0 0l1.125 4.5m-1.125-4.5h11.25m-9 
            4.5a1.125 1.125 0 11-2.25 0m2.25 0a1.125 
            1.125 0 11-2.25 0m12 0a1.125 1.125 0 
            11-2.25 0m2.25 0a1.125 1.125 0 11-2.25 0"
            />
          </svg>

          {/* Soft Glow */}
          <div className="absolute inset-0 bg-blue-300 blur-3xl opacity-20 rounded-full"></div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mt-8 tracking-wide">
          Your Cart is Feeling Light 🎒
        </h2>

        <p className="text-gray-600 mt-3 text-center max-w-md">
          Looks like you haven’t added anything yet.
          Browse our medicines & feed to keep your animals healthy and active!
        </p>

        {/* Recommended Category Buttons */}
        <div className="flex gap-4 mt-8">
          <Link
            to="/medicin"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1"
          >
            Explore Medicines
          </Link>

          <Link
            to="/feed"
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition transform hover:-translate-y-1"
          >
            Explore Feed
          </Link>
        </div>

        {/* Encouragement message */}
        <div className="mt-10 text-sm text-gray-500 italic">
          Your animals deserve the best care ❤️
        </div>

        {/* Custom bounce animation */}
        <style>
          {`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
        `}
        </style>
      </div>
    );
  }


  return (
    <div className="max-w-6xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

      {/* LEFT SIDE – PRODUCT LIST */}
      <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Shopping Cart</h2>

        <div className="space-y-5">

          {cartItems.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition"
            >

              {/* IMAGE + NAME */}
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 object-contain rounded-lg bg-gray-50"
                />

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 leading-tight">{item.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Price: <span className="font-medium">৳{Number(item.price).toFixed(2)}</span><span className="text-green-500">  (- {Number(((((item.discount) / 100) * (item.price))) * item.quantity).toFixed(2)})</span>
                  </p>
                </div>
              </div>

              {/* QTY + TOTAL + REMOVE */}
              <div className="flex flex-col items-end">

                {/* Quantity Control */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="border p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="px-3 py-1 border rounded text-gray-700">
                    {item.quantity || 1}
                  </span>

                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className={`border p-1 rounded transition ${item.quantity >= (item.maxStock || item.piece)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-gray-100'
                      }`}
                    disabled={item.quantity >= (item.maxStock || item.piece)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Show stock limit */}
                  <span className="text-xs text-gray-500">
                    (Max: {item.maxStock || item.piece})
                  </span>
                </div>

                {/* Item Total */}
                <p className="text-right font-semibold text-blue-600">
                  ৳ {(Number((item.price) * (item.quantity)) - ((((item.discount) / 100) * (item.price))) * (item.quantity || 1)).toFixed(2)}
                </p>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="mt-1 flex items-center gap-1 text-red-500 hover:text-red-700 text-sm"
                >
                  <Trash className="w-4 h-4" /> Remove
                </button>
              </div>

            </div>
          ))}

        </div>
      </div>

      {/* RIGHT SIDE – ORDER SUMMARY */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 sticky top-24 h-fit">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>

        <div className="flex justify-between text-gray-700 mb-3">
          <span>Subtotal</span>
          <span>৳{getTotal().toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-700 mb-3">
          <span>Delivery Charge</span>
          <span className="text-green-600 font-medium">৳ 59</span>
        </div>

        <div className="border-t my-4"></div>

        <div className="flex justify-between text-lg font-semibold text-gray-900 mb-6">
          <span>Total</span>
          <span>৳{(getTotal() + 59).toFixed(2)}</span>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition shadow"
        >
          Proceed to Checkout
        </button>

        <button
          onClick={clearCart}
          className="w-full mt-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition"
        >
          Clear Cart
        </button>

        <Link
          to="/"
          className="mt-4 block text-center text-blue-600 hover:underline"
        >
          Continue Shopping →
        </Link>
      </div>

    </div>
  );
};

export default Cart;

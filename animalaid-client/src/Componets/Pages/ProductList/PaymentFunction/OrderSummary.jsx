// src/components/OrderSummary.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trash, ShoppingCart } from "lucide-react";
import { useCart } from "../../../../Context/CartContext.jsx";

const OrderSummary = ({ cartItems: propsItems, total: propsTotal, onUpdate, onRemove, showTitle = true }) => {
  const ctx = useCart();
  const cartItems = propsItems ?? ctx.cartItems ?? [];
  const total = propsTotal ?? (ctx.getTotal ? ctx.getTotal() : 0);
  const updateQuantity = onUpdate ?? ctx.updateQuantity;
  const removeFromCart = onRemove ?? ctx.removeFromCart;

  const [collapsed, setCollapsed] = useState(false);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <ShoppingCart className="mx-auto h-20 w-20 text-gray-300 mb-6" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
        <p className="text-gray-500">Add medicines or feed to start your order.</p>
        <Link className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded-md" to="/">Continue shopping</Link>
      </div>
    );
  }

  return (
    <aside className="w-full">
      {showTitle && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Order Summary</h3>

          {/* collapse toggle for mobile */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-sm text-gray-600 underline hidden md:inline"
            aria-expanded={!collapsed}
          >
            {collapsed ? "Show items" : "Hide items"}
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* items area */}
        <div className={`p-4 ${collapsed ? "hidden md:block" : ""} max-h-[56vh] overflow-y-auto custom-scroll`}>
          {cartItems.map((it) => (
            <div key={it.id} className="flex items-start gap-3 py-3 border-b last:border-b-0">
              <img src={it.image} alt={it.name} className="w-16 h-16 object-contain rounded-md bg-gray-50" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 truncate">{it.name}</h4>
                    <p className="text-sm text-blue-500 mt-1">৳{Number(it.price).toFixed(2)} x {(it.quantity || 1)}</p>
                    {it.variant && <p className="text-xs text-gray-400 mt-1">{it.variant}</p>}
                  </div>
                  <div className="text-sm font-semibold text-blue-700 whitespace-nowrap">৳{(Number(it.price) * (it.quantity || 1)).toFixed(2)}</div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={it.quantity || 1}
                    onChange={(e) => updateQuantity && updateQuantity(it.id, Math.max(1, Number(e.target.value) || 1))}
                    className="w-20 py-1 px-2 border rounded text-sm text-center"
                    aria-label={`Quantity for ${it.name}`}
                  />
                  <button
                    onClick={() => removeFromCart && removeFromCart(it.id)}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                    aria-label={`Remove ${it.name}`}
                  >
                    <Trash className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* sticky summary row */}
        <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-shadow-md text-gray-900">Subtotal</div>
            <div className="text-lg font-semibold text-blue-700">৳{(Number(total) + 59).toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">Delivery calculated at checkout</div>
          </div>

          <div className="flex gap-2 items-center">
            <Link to="/cart" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm shadow hover:bg-blue-700">View Cart</Link>
          </div>
        </div>
      </div>

      {/* small style for scrollbar */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 8px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.4); border-radius: 999px; }
      `}</style>
    </aside>
  );
};

export default OrderSummary;

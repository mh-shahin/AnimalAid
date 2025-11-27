import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "../ProductList/PaymentFunction/Stepper.jsx";
import OrderSummary from "../ProductList/PaymentFunction/OrderSummary.jsx";
import { useCart } from "../../../Context/CartContext.jsx";

const Checkout = () => {
  const { cartItems, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const total = getTotal ? getTotal() : 0;

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    postal: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const requiredFilled = () =>
    address.name.trim() &&
    address.phone.trim() &&
    address.addressLine.trim() &&
    address.city.trim() &&
    address.postal.trim();

  const goNext = () => {
    if (step === 0 && !requiredFilled()) {
      setError("Please fill all input field before continuing.");
      return;
    }
    setError("");
    setStep((s) => Math.min(2, s + 1));
  };

  // ✅ FIXED: Better handling of product_type
  const mapCartItemsToOrderItems = () => {
    return cartItems.map((item) => {
      // Try multiple possible field names for product type
      const productType = 
        item.product_type || 
        item.type || 
        item.productType ||
        (item.category && item.category.toLowerCase()) ||
        "medicine"; // Last resort default

      return {
        product: item.id,
        quantity: item.quantity,
        product_type: productType,
      };
    });
  };

  const handlePlaceOrderCOD = async () => {
    if (!requiredFilled()) {
      setError("Please fill required fields.");
      return;
    }
    setLoading(true);

    try {
      // ✅ Use the improved mapping function
      const items = mapCartItemsToOrderItems();

      // ✅ Validate that we have the correct types
      const hasInvalidTypes = items.some(
        item => !["medicine", "feed"].includes(item.product_type)
      );
      
      if (hasInvalidTypes) {
        console.warn("⚠️ Some items have invalid product_type:", items);
      }

      const orderPayload = {
        user: 1, // Replace with actual authenticated user ID
        total_amount: parseFloat(total),
        delivery_charge: 59.00,
        discount_amount: 0.00,
        items: items,
        shipping_address: {
          name: address.name,
          phone: address.phone,
          address_line: address.addressLine,
          city: address.city,
          postal: address.postal,
          country: "Bangladesh"
        },
        payment: {
          method: "cod",
          provider: "",
          transaction_id: "",
          sender_phone: "",
          amount: parseFloat(total) + 59.00,
          status: "pending",
        },
        customer_notes: ""
      };

      const res = await fetch("http://127.0.0.1:8000/orders/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Clear cart
        clearCart();
        localStorage.removeItem('animalaid_cart');
                
        // Navigate to success page
        setTimeout(() => {
          navigate("/checkout/success", {
            state: {
              success: true,
              message: data.message || "Order placed successfully.",
              orderId: data.order_id,
              total: total + 59,
              createdAt: data.created_at,
            },
            replace: true,
          });
        }, 100);
      } else {
        console.error("❌ COD order failed:", data);
        setError(data.message || "Could not place order. Try again later.");
      }
    } catch (err) {
      console.error("❌ COD order error:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToProvider = () => {
    if (!requiredFilled()) {
      setError("Please fill required fields before proceeding.");
      return;
    }
    if (!paymentMethod) {
      setError("Please choose a payment provider.");
      return;
    }

    // ✅ Use the improved mapping function
    const items = mapCartItemsToOrderItems();

    const orderPayload = {
      user: 1,
      total_amount: parseFloat(total),
      delivery_charge: 59.00,
      discount_amount: 0.00,
      items,
      shipping_address: {
        name: address.name,
        phone: address.phone,
        address_line: address.addressLine,
        city: address.city,
        postal: address.postal,
        country: "Bangladesh"
      },
      payment: {
        method: paymentMethod,
        provider: paymentMethod,
        transaction_id: "",
        sender_phone: "",
        amount: parseFloat(total) + 59.00,
        status: "pending",
      },
      customer_notes: ""
    };

    navigate(`/payment/${paymentMethod}`, {
      state: { orderPayload },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <main className="lg:col-span-2 bg-white rounded-lg shadow p-6">
        <Stepper steps={["Address", "Payment", "Confirm"]} current={step} />

        {/* Address */}
        {step === 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-2">Shipping Information</h2>
            <p className="text-sm text-gray-600 mb-4">
              Fill required fields to continue.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Full name *
                </span>
                <input
                  value={address.name}
                  onChange={(e) =>
                    setAddress({ ...address, name: e.target.value })
                  }
                  className="mt-1 w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Phone *
                </span>
                <input
                  value={address.phone}
                  onChange={(e) =>
                    setAddress({ ...address, phone: e.target.value })
                  }
                  className="mt-1 w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <label className="md:col-span-2 block">
                <span className="text-sm font-medium text-gray-700">
                  Address *
                </span>
                <textarea
                  value={address.addressLine}
                  onChange={(e) =>
                    setAddress({ ...address, addressLine: e.target.value })
                  }
                  className="mt-1 w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                  rows="3"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-gray-700">
                  City *
                </span>
                <input
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  className="mt-1 w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-gray-700">
                  Postal *
                </span>
                <input
                  value={address.postal}
                  onChange={(e) =>
                    setAddress({ ...address, postal: e.target.value })
                  }
                  className="mt-1 w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            </div>

            {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={goNext}
                className="px-5 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
              >
                Continue to payment
              </button>
            </div>
          </>
        )}

        {/* Payment */}
        {step === 1 && (
          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-1">Payment Method</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* COD */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "cod"
                    ? "border-blue-600 bg-blue-50"
                    : "hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span className="ml-2 font-medium">Cash on Delivery</span>
              </label>

              {/* bKash */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "bkash"
                    ? "border-pink-600 bg-pink-50"
                    : "hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "bkash"}
                  onChange={() => setPaymentMethod("bkash")}
                />
                <span className="ml-2 font-medium">bKash</span>
              </label>

              {/* Nagad */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "nagad"
                    ? "border-orange-600 bg-orange-50"
                    : "hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "nagad"}
                  onChange={() => setPaymentMethod("nagad")}
                />
                <span className="ml-2 font-medium">Nagad</span>
              </label>

              {/* Rocket */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "rocket"
                    ? "border-purple-600 bg-purple-50"
                    : "hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "rocket"}
                  onChange={() => setPaymentMethod("rocket")}
                />
                <span className="ml-2 font-medium">Rocket</span>
              </label>
            </div>

            {error && <p className="text-red-600 mt-3">{error}</p>}

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(0)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Back
              </button>

              {paymentMethod === "cod" ? (
                <button
                  onClick={handlePlaceOrderCOD}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Placing..." : "Place Order (COD)"}
                </button>
              ) : (
                <button
                  onClick={handleProceedToProvider}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Proceed to Payment
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <OrderSummary showTitle={false} />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
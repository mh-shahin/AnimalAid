// import React, { useState } from "react";
// import { useCart } from "../../../Context/CartContext.jsx";
// import { useNavigate } from "react-router-dom";

// const Checkout = () => {
//   const { cartItems, getTotal, clearCart } = useCart();
//   const navigate = useNavigate();

//   const [address, setAddress] = useState({ name: "", phone: "", addressLine: "", city: "", postal: "" });
//   const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' or 'mobile'
//   const [processing, setProcessing] = useState(false);
//   const [error, setError] = useState("");

//   if (!cartItems.length) {
//     return (
//       <div className="text-center mt-20">
//         <h2 className="text-2xl font-semibold">Your cart is empty</h2>
//       </div>
//     );
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     // Basic validation
//     if (!address.name || !address.phone || !address.addressLine) {
//       setError("Please fill in name, phone and address.");
//       return;
//     }

//     setProcessing(true);

//     // Simulate API call to create order -> replace with real endpoint later (Django)
//     try {
//       // Simulated delay
//       await new Promise(r => setTimeout(r, 1500));

//       // If using mobile banking, simulate a redirect or verification step
//       if (paymentMethod === "mobile") {
//         // Simulate mobile bank QR/payment success
//         await new Promise(r => setTimeout(r, 1000));
//       }

//       // Order success: clear cart and navigate to success page
//       clearCart();
//       navigate("/checkout/success", { state: { message: "Order placed successfully.", total: getTotal() } });
//     } catch (err) {
//       console.error(err);
//       setError("Failed to process the order. Please try again.");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
//       <h2 className="text-2xl font-semibold mb-4">Checkout</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium">Full name</label>
//           <input value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full border rounded px-3 py-2 mt-1" />
//         </div>

//         <div>
//           <label className="block text-sm font-medium">Phone</label>
//           <input value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full border rounded px-3 py-2 mt-1" />
//         </div>

//         <div>
//           <label className="block text-sm font-medium">Address</label>
//           <textarea value={address.addressLine} onChange={e => setAddress({...address, addressLine: e.target.value})} className="w-full border rounded px-3 py-2 mt-1" />
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium">City</label>
//             <input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full border rounded px-3 py-2 mt-1" />
//           </div>
//           <div>
//             <label className="block text-sm font-medium">Postal / ZIP</label>
//             <input value={address.postal} onChange={e => setAddress({...address, postal: e.target.value})} className="w-full border rounded px-3 py-2 mt-1" />
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">Payment method</label>
//           <div className="space-y-2">
//             <label className="flex items-center gap-3">
//               <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
//               <span>Cash on Delivery (Pay when courier arrives)</span>
//             </label>
//             <label className="flex items-center gap-3">
//               <input type="radio" checked={paymentMethod === "mobile"} onChange={() => setPaymentMethod("mobile")} />
//               <span>Mobile Banking (bKash / Rocket / Nagad - simulated)</span>
//             </label>
//           </div>
//         </div>

//         <div className="bg-gray-50 p-4 rounded">
//           <div className="flex justify-between">
//             <span className="text-sm text-gray-600">Products</span>
//             <span className="font-medium">৳{getTotal().toFixed(2)}</span>
//           </div>
//         </div>

//         {error && <div className="text-red-600">{error}</div>}

//         <div className="flex items-center gap-3">
//           <button disabled={processing} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
//             {processing ? "Processing..." : (paymentMethod === "cod" ? "Place Order (COD)" : "Proceed to Mobile Payment")}
//           </button>
//           <button type="button" className="text-gray-700 border px-4 py-2 rounded" onClick={() => navigate(-1)}>Back</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Checkout;

import React, { useState } from "react";
import { useCart } from "../../../Context/CartContext.jsx";
import { useNavigate } from "react-router-dom";

/*
  Option A: simple mobile-bank simulation.
  - If 'mobile' chosen, we show a modal to enter sender phone + transaction id.
  - We simulate a verification delay and then confirm the order.
*/

const Spinner = ({ size = 20 }) => (
  <svg className={`animate-spin inline-block w-${size} h-${size}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const Checkout = () => {
  const { cartItems, getTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    postal: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' | 'mobile'
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showMobileModal, setShowMobileModal] = useState(false);

  // mobile payment modal values
  const [mobilePhone, setMobilePhone] = useState("");
  const [txId, setTxId] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [mobileProcessing, setMobileProcessing] = useState(false);

  if (!cartItems.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <p className="text-gray-600">Add some medicines or feed to checkout.</p>
      </div>
    );
  }

  const requiredFilled = () =>
    address.name.trim() && address.phone.trim() && address.addressLine.trim();

  const simulateServerOrder = async (payload) => {
    // In real-app: POST /api/orders with payload
    // Simulate network + server processing delay
    await new Promise((r) => setTimeout(r, 1400));
    // simulate order id
    return {
      success: true,
      orderId: `AA-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };
  };

  const handlePlaceOrderCOD = async (e) => {
    e.preventDefault();
    setError("");
    if (!requiredFilled()) {
      setError("Please fill in name, phone and address.");
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        cart: cartItems,
        address,
        payment: { method: "cod" },
        total: getTotal(),
      };

      const res = await simulateServerOrder(payload);

      if (res.success) {
        clearCart();
        navigate("/checkout/success", {
          state: {
            message: "Order placed successfully (Cash on Delivery).",
            total: getTotal(),
            orderId: res.orderId,
            createdAt: res.createdAt,
            payment: { method: "cod" },
          },
        });
      } else {
        setError("Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  const openMobileModal = (e) => {
    e.preventDefault();
    if (!requiredFilled()) {
      setError("Please fill in name, phone and address before mobile payment.");
      return;
    }
    setMobilePhone("");
    setTxId("");
    setMobileError("");
    setShowMobileModal(true);
  };

  const handleMobilePaymentSubmit = async (e) => {
    e.preventDefault();
    setMobileError("");

    // basic validation
    if (!mobilePhone.trim() || !txId.trim()) {
      setMobileError("Please enter sender phone and transaction ID.");
      return;
    }
    // optional: basic format checks
    if (!/^\d{10,14}$/.test(mobilePhone)) {
      setMobileError("Enter a valid phone number (digits only).");
      return;
    }
    if (txId.length < 6) {
      setMobileError("Transaction ID looks too short.");
      return;
    }

    setMobileProcessing(true);

    try {
      // Simulate server verification of tx id
      await new Promise((r) => setTimeout(r, 1400));

      // We'll treat txId as valid for the demo
      const payload = {
        cart: cartItems,
        address,
        payment: { method: "mobile", provider: "bKash/Nagad/Rocket", senderPhone: mobilePhone, txId },
        total: getTotal(),
      };

      const res = await simulateServerOrder(payload);

      if (res.success) {
        clearCart();
        setShowMobileModal(false);
        navigate("/checkout/success", {
          state: {
            message: "Payment successful. Order placed.",
            total: getTotal(),
            orderId: res.orderId,
            createdAt: res.createdAt,
            payment: { method: "mobile", provider: "bKash/Nagad/Rocket", senderPhone: mobilePhone, txId },
          },
        });
      } else {
        setMobileError("Transaction verification failed. Please check and retry.");
      }
    } catch (err) {
      console.error(err);
      setMobileError("Verification error. Try again.");
    } finally {
      setMobileProcessing(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: FORM */}
        <form className="lg:col-span-2 bg-white rounded-xl shadow p-6" onSubmit={paymentMethod === "cod" ? handlePlaceOrderCOD : openMobileModal}>
          <h2 className="text-2xl font-semibold mb-4">Checkout</h2>

          {/* Step hint */}
          <div className="mb-4 text-sm text-gray-600">
            Complete the form and choose a payment method. All fields are required.
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Full name</span>
              <input
                value={address.name}
                onChange={(e) => setAddress({ ...address, name: e.target.value })}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Your full name"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Phone</span>
              <input
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="e.g. 01XXXXXXXXX"
                required
              />
            </label>
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Address</span>
              <textarea
                value={address.addressLine}
                onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows={3}
                placeholder="House, road, area, landmark..."
                required
              />
            </label>
          </div>

          {/* City + Postal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">City</span>
              <input
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="City"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Postal / ZIP</span>
              <input
                value={address.postal}
                onChange={(e) => setAddress({ ...address, postal: e.target.value })}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Postal code"
              />
            </label>
          </div>

          {/* Payment method */}
          <div className="mb-6">
            <span className="text-sm font-medium text-gray-700 block mb-2">Payment method</span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className={`p-3 border rounded-lg cursor-pointer transition ${paymentMethod === "cod" ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mr-2"
                />
                <span className="font-medium">Cash on Delivery</span>
                <div className="text-sm text-gray-500 mt-1">Pay when courier delivers the order</div>
              </label>

              <label className={`p-3 border rounded-lg cursor-pointer transition ${paymentMethod === "mobile" ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"}`}>
                <input
                  type="radio"
                  name="payment"
                  value="mobile"
                  checked={paymentMethod === "mobile"}
                  onChange={() => setPaymentMethod("mobile")}
                  className="mr-2"
                />
                <span className="font-medium">Mobile Banking (bKash / Rocket / Nagad)</span>
                <div className="text-sm text-gray-500 mt-1">After payment, enter transaction ID to confirm</div>
              </label>
            </div>
          </div>

          {/* Order note / summary small */}
          <div className="mb-6 bg-gray-50 p-4 rounded border border-gray-100 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Products</span>
              <span className="font-medium">৳{getTotal().toFixed(2)}</span>
            </div>
            <div className="text-gray-500 text-xs mt-2">
              Delivery charge calculated at checkout. You will receive an SMS/Email with order details.
            </div>
          </div>

          {error && <div className="text-red-600 mb-2">{error}</div>}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {paymentMethod === "cod" ? (
              <button
                type="submit"
                disabled={processing}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {processing ? "Placing order..." : "Place Order (COD)"}
              </button>
            ) : (
              <button
                onClick={openMobileModal}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:opacity-95 transition font-medium"
              >
                {mobileProcessing ? "Processing..." : "Pay with Mobile Banking"}
              </button>
            )}

            <button
              type="button"
              className="text-gray-700 border px-4 py-2 rounded-lg"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>
        </form>

        {/* RIGHT: ORDER SUMMARY */}
        <aside className="bg-white rounded-xl shadow p-6 border border-gray-100 h-fit">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

          <div className="space-y-3">
            {cartItems.map((it) => (
              <div key={it.id} className="flex items-center gap-3">
                <img src={it.image} alt={it.name} className="w-14 h-14 object-contain rounded" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{it.name}</div>
                  <div className="text-xs text-gray-500">x{it.quantity || 1}</div>
                </div>
                <div className="text-sm font-semibold text-blue-600">৳{(it.price * (it.quantity || 1)).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="border-t my-4"></div>

          <div className="flex justify-between text-gray-700 mb-2">
            <span>Subtotal</span>
            <span>৳{getTotal().toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-gray-700 mb-4">
            <span>Delivery</span>
            <span className="text-green-600 font-medium">৳ 59</span>
          </div>

          <div className="flex justify-between text-lg font-semibold text-gray-900 mb-2">
            <span>Total</span>
            <span>৳{(getTotal() + 59).toFixed(2)}</span>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            By placing an order you agree to our <span className="underline">Terms & Conditions</span>.
          </div>
        </aside>
      </div>

      {/* Mobile Payment Modal */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3">Mobile Banking Payment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send the total amount to our merchant number by bKash / Rocket / Nagad. Then enter sender number and transaction ID below.
            </p>

            <form onSubmit={handleMobilePaymentSubmit}>
              <label className="block mb-3">
                <span className="text-sm font-medium text-gray-700">Sender phone (used for verification)</span>
                <input
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="01XXXXXXXXX"
                />
              </label>

              <label className="block mb-3">
                <span className="text-sm font-medium text-gray-700">Transaction ID</span>
                <input
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. TX12345678"
                />
              </label>

              {mobileError && <div className="text-red-600 mb-2">{mobileError}</div>}

              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setShowMobileModal(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button
                  type="submit"
                  disabled={mobileProcessing}
                  className="px-5 py-2 rounded bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium"
                >
                  {mobileProcessing ? "Verifying..." : "Submit Transaction"}
                </button>
              </div>
            </form>

            <div className="mt-4 text-xs text-gray-500">
              Tip: Use a mock transaction id like <span className="font-mono">TX123456</span> for demo/testing.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;


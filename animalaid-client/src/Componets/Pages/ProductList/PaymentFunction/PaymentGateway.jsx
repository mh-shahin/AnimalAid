import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../../../Context/CartContext.jsx";

const providers = {
  bkash: { name: "bKash", color: "from-pink-500 to-pink-600", merchant: "017-XXXX-XXXX" },
  nagad: { name: "Nagad", color: "from-red-500 to-red-600", merchant: "018-XXXX-XXXX" },
  rocket: { name: "Rocket", color: "from-yellow-500 to-yellow-600", merchant: "019-XXXX-XXXX" },
};

const PaymentGateway = () => {
  const { provider } = useParams();
  const info = providers[provider] || providers.bkash;
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const orderPayload = location.state?.orderPayload;
  const [senderPhone, setSenderPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!orderPayload) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No payment in progress</h3>
          <p className="text-sm text-gray-600">Please start payment from the checkout page.</p>
        </div>
      </div>
    );
  }

  const handlePayNow = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{10,14}$/.test(senderPhone)) {
      setError("Enter a valid sender phone (digits only).");
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment gateway delay
      await new Promise((r) => setTimeout(r, 1000));

      // Generate transaction ID
      const txId = `${provider.toUpperCase().slice(0, 3)}-${Math.random()
        .toString(36)
        .slice(2, 10)
        .toUpperCase()}`;

      // Update payment info with transaction details
      const updatedPayload = {
        ...orderPayload,
        payment: {
          ...orderPayload.payment,
          provider: provider,
          transaction_id: txId,
          sender_phone: senderPhone,
          amount: orderPayload.total_amount + (orderPayload.delivery_charge || 59),
          status: "paid",
        },
      };

      // Create order in backend
      const res = await fetch("http://127.0.0.1:8000/orders/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPayload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Clear cart from context and localStorage
        clearCart();
        localStorage.removeItem('animalaid_cart');
                
        // Navigate to success page after a brief delay
        setTimeout(() => {
          navigate("/checkout/success", {
            state: {
              success: true,
              orderId: data.order_id,
              total: orderPayload.total_amount + (orderPayload.delivery_charge || 59),
              createdAt: data.created_at,
              payment: {
                provider,
                txId,
                senderPhone,
                method: provider
              },
              message: data.message || "Payment successful",
            },
            replace: true,
          });
        }, 100);
      } else {
        console.error("Payment order failed:", data);
        setError(data.message || "Payment failed on server. Try again.");
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setError("Payment processing failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const totalAmount = (orderPayload.total_amount + (orderPayload.delivery_charge || 59)).toFixed(2);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md border p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{info.name} Payment</h2>
            <p className="text-sm text-gray-500 mt-1">
              Merchant: <span className="font-mono">{info.merchant}</span>
            </p>
          </div>

          <span className={`px-4 py-2 rounded-lg text-white text-sm font-medium shadow bg-gradient-to-r ${info.color}`}>
            Demo Gateway
          </span>
        </div>

        <div className="bg-gray-100 border rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount to Pay</span>
            <span className="text-xl font-bold text-gray-900">
              ৳{totalAmount}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2 leading-5">
            Send this amount to the merchant using your {info.name} account.
          </p>
        </div>

        <form onSubmit={handlePayNow} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 font-medium">
              Your {info.name} Phone Number
            </label>
            <input
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-300 outline-none transition"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded border border-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end sm:justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border shadow-sm hover:bg-gray-100 transition text-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={processing}
              className="px-6 py-3 rounded-lg text-white font-medium shadow bg-gradient-to-r from-green-500 to-blue-600 hover:opacity-90 transition disabled:opacity-60"
            >
              {processing ? "Processing Payment..." : `Pay ৳${totalAmount}`}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-6 text-center leading-5">
          This is a demo payment gateway. Transaction will be recorded in the database.
        </p>
      </div>
    </div>
  );
};

export default PaymentGateway;
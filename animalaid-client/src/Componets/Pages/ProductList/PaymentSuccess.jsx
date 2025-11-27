import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No order information found</h3>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const { orderId, total, payment, message, createdAt } = state;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {message || "Thank you for your order. We'll process it shortly."}
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-sm font-medium text-gray-600">Order ID</span>
            <span className="text-lg font-semibold text-gray-900 font-mono">
              {orderId}
            </span>
          </div>

          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-sm font-medium text-gray-600">Total Amount</span>
            <span className="text-xl font-bold text-green-600">
              ৳{parseFloat(total).toFixed(2)}
            </span>
          </div>

          {payment && (
            <>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-sm font-medium text-gray-600">Payment Method</span>
                <span className="text-md font-medium text-gray-900 capitalize">
                  {payment.method || payment.provider || "COD"}
                </span>
              </div>

              {payment.txId && (
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-sm font-medium text-gray-600">Transaction ID</span>
                  <span className="text-sm font-mono text-gray-900">
                    {payment.txId}
                  </span>
                </div>
              )}

              {payment.senderPhone && (
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-sm font-medium text-gray-600">Sender Phone</span>
                  <span className="text-sm font-mono text-gray-900">
                    {payment.senderPhone}
                  </span>
                </div>
              )}
            </>
          )}

          {createdAt && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Order Date</span>
              <span className="text-sm text-gray-900">
                {new Date(createdAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You'll receive a confirmation email shortly</li>
            <li>• We'll notify you when your order is shipped</li>
            <li>• Track your order status in your account</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate(`/orders`)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
import React from "react";
import { useLocation, Link } from "react-router-dom";

const PaymentSuccess = () => {
  const { state } = useLocation();
  const message = state?.message || "Payment / order successful!";
  const total = state?.total?.toFixed ? state.total.toFixed(2) : (state?.total ?? null);
  const orderId = state?.orderId ?? null;
  const createdAt = state?.createdAt ? new Date(state.createdAt).toLocaleString() : null;
  const payment = state?.payment ?? {};

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow p-8 text-center">
        <div className="text-green-600 text-4xl mb-4">✓</div>
        <h1 className="text-2xl font-semibold mb-2">{message}</h1>

        {orderId && <div className="text-sm text-gray-500 mb-2">Order ID: <span className="font-mono">{orderId}</span></div>}
        {createdAt && <div className="text-sm text-gray-500 mb-2">Placed: {createdAt}</div>}
        {total && <div className="text-lg font-semibold text-gray-800 mb-4">Total paid: ৳{total}</div>}

        {payment.method === "mobile" && (
          <div className="bg-gray-50 p-3 rounded mb-4 text-left text-sm">
            <div><strong>Payment method:</strong> Mobile Banking</div>
            <div><strong>Provider:</strong> {payment.provider ?? "bKash / Nagad / Rocket"}</div>
            <div><strong>Sender:</strong> {payment.senderPhone}</div>
            <div><strong>Transaction ID:</strong> <span className="font-mono">{payment.txId}</span></div>
          </div>
        )}

        {payment.method === "cod" && (
          <div className="bg-gray-50 p-3 rounded mb-4 text-left text-sm">
            <div><strong>Payment method:</strong> Cash on Delivery</div>
            <div className="text-gray-600 mt-2">Please keep the exact amount ready for the courier.</div>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <Link to="/" className="px-5 py-2 rounded bg-blue-600 text-white">Continue Shopping</Link>
          <Link to="/orders" className="px-5 py-2 rounded border">View Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

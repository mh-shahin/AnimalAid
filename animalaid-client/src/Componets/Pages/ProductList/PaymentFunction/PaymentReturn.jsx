// src/pages/PaymentReturn.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentReturn = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state) {
      navigate("/checkout");
      return;
    }

    // In real app: call backend endpoint to confirm payment & create order record
    // For demo: redirect to success with state
    const timer = setTimeout(() => {
      navigate("/checkout/success", { state });
    }, 800);

    return () => clearTimeout(timer);
  }, [state, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-t-4 border-blue-600 rounded-full mx-auto mb-4"></div>
        <div className="text-lg font-medium mb-2">Finalizing payment...</div>
        <div className="text-sm text-gray-500">Please wait—confirming transaction with the gateway.</div>
      </div>
    </div>
  );
};

export default PaymentReturn;

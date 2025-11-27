import React from "react";

const Stepper = ({ steps = [], current = 0 }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i <= current ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
            {i + 1}
          </div>
          <div className={`text-sm ${i <= current ? "text-gray-900" : "text-gray-500"}`}>{s}</div>
        </div>
      ))}
    </div>
  );
};

export default Stepper;

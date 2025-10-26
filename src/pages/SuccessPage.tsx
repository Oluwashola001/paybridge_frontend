// src/pages/SuccessPage.tsx
import React from "react";
import { useParams } from "react-router-dom";

const SuccessPage: React.FC = () => {
  const { invoiceId } = useParams();
  
  // Use environment variable for API URL
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  
  const handleDownloadReceipt = () => {
    window.open(
      `${apiUrl}/invoices/${invoiceId}/receipt`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-green-700">
        Payment Successful ✅
      </h1>
      <p className="mb-6">Invoice ID: {invoiceId}</p>
      <button
        onClick={handleDownloadReceipt}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
      >
        Download Receipt
      </button>
    </div>
  );
};

export default SuccessPage;
// src/pages/InvoicePage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// We declare the global function so TypeScript doesn't complain
declare global {
  interface Window {
    FlutterwaveCheckout: (options: any) => void;
  }
}

// --- UPDATED INTERFACE ---
interface Invoice {
  invoice_id: string;
  client_name: string;
  description: string;
  amount: string;
  // wallet_address: string; // Removed
  client_email: string | null; // Added
  client_phone: string | null; // Added
  status: string;
}

const InvoicePage: React.FC = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true); // Start loading
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [flutterwavePublicKey, setFlutterwavePublicKey] = useState("");

  const apiUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
  const frontendUrl = "https://paybridge-frontend-sooty.vercel.app";

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // ✅ This hook now fetches data AND waits for the script
  useEffect(() => {
    let isMounted = true;

    // Function to wait for the script in index.html to load
    const waitForFlutterwaveScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 20; // Wait max 10 seconds
        const interval = setInterval(() => {
          if (typeof window.FlutterwaveCheckout === "function") {
            clearInterval(interval);
            console.log("Flutterwave script is ready.");
            resolve();
          } else {
            attempts++;
            if (attempts > maxAttempts) {
              clearInterval(interval);
              console.error("Timed out waiting for Flutterwave script.");
              reject(
                new Error("Payment script failed to load. Please refresh.")
              );
            }
          }
        }, 500); // Check every 500ms
      });
    };

    const fetchData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError("");

        // 1. Define all async tasks
        const fetchInvoiceTask = axios.get(`${apiUrl}/invoices/${invoiceId}`);
        const fetchKeyTask = axios.get(`${apiUrl}/config/flutterwave-key`);
        const loadScriptTask = waitForFlutterwaveScript(); // This promise waits for the script

        // 2. Wait for all tasks to complete in parallel
        const [invoiceRes, keyRes] = await Promise.all([
          fetchInvoiceTask,
          fetchKeyTask,
          loadScriptTask,
        ]);

        if (!isMounted) return; // Component unmounted

        // 3. Process Invoice Data
        if (invoiceRes.data && invoiceRes.data.invoice_id) {
          setInvoice(invoiceRes.data);
        } else {
          throw new Error("Invoice not found");
        }

        // 4. Process Key Data
        if (keyRes.data && keyRes.data.publicKey) {
          setFlutterwavePublicKey(keyRes.data.publicKey);
          console.log("Flutterwave Public Key fetched successfully.");
        } else {
          throw new Error("Payment configuration error");
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error during setup:", err);
          setError(
            err.message || "Unable to load invoice or payment configuration."
          );
        }
      } finally {
        if (isMounted) setLoading(false); // Stop loading *only* after all tasks are done
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [invoiceId, apiUrl]);

  const handlePayment = () => {
    if (
      !invoice ||
      !flutterwavePublicKey ||
      typeof window.FlutterwaveCheckout !== "function"
    ) {
      alert("Payment service is not ready. Please refresh the page and try again.");
      return;
    }

    setIsProcessing(true);

    window.FlutterwaveCheckout({
      public_key: flutterwavePublicKey.trim(),
      tx_ref: invoice.invoice_id,
      amount: parseFloat(invoice.amount),
      currency: "USD",
      payment_options: "card,googlepay,applepay",
      // --- UPDATED CUSTOMER INFO ---
      // Use the client's details from the invoice, with a fallback.
      customer: {
        email: invoice.client_email || "yourbusiness@gmail.com",
        phone_number: invoice.client_phone || "+1-555-000-0000",
        name: invoice.client_name,
      },
      customizations: {
        title: "PayBridge Invoice",
        description: invoice.description,
        logo: `${frontendUrl}/logo-paybridge.png`,
      },
      callback: function (response: any) {
        console.log("Flutterwave Payment Response:", response);
        setIsProcessing(false);
        if (response.status === "successful" || response.status === "completed") {
          navigate(`/success/${invoiceId}`);
        } else {
          alert("Payment was not successful. Please try again.");
        }
      },
      onclose: function () {
        console.log("Flutterwave modal closed.");
        setIsProcessing(false);
      },
    });
  };

  // --- JSX Rendering Logic ---
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900"
            : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p
            className={`text-lg font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Loading payment details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 py-8 px-4 ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900"
            : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100"
        }`}
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2
            className={`text-2xl font-bold mb-2 ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Error Loading
          </h2>
          <p
            className={`mb-6 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {error || "The invoice data could not be loaded."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 py-8 px-4 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100"
      }`}
    >
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed top-4 right-4 sm:top-6 sm:right-6 p-3 rounded-xl transition-all duration-300 z-10 ${
          isDarkMode
            ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
            : "bg-white hover:bg-gray-100 text-gray-700 shadow-lg"
        }`}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 001-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            ></path>
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
          </svg>
        )}
      </button>

      {/* Invoice Card */}
      <div className="w-full max-w-lg">
        <div
          className={`p-8 sm:p-10 rounded-2xl shadow-2xl backdrop-blur-sm border transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-800/50 border-gray-700"
              : "bg-white/80 border-gray-100"
          }`}
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent"
              }`}
            >
              Invoice Details
            </h1>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Review and complete payment
            </p>
          </div>

          {/* Invoice Info */}
          <div className="space-y-5 mb-8">
            <div
              className={`p-4 rounded-xl ${
                isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <label
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Invoice ID
              </label>
              <p
                className={`font-mono text-sm mt-1 ${
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {invoice.invoice_id}
              </p>
            </div>
            
            {/* --- UPDATED CLIENT DETAILS --- */}
            <div
              className={`p-4 rounded-xl ${
                isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <label
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Client
              </label>
              <p
                className={`text-lg font-semibold mt-1 ${
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {invoice.client_name}
              </p>
              {/* Show email if it exists */}
              {invoice.client_email && (
                 <p
                 className={`text-sm mt-1 ${
                   isDarkMode ? "text-gray-300" : "text-gray-700"
                 }`}
               >
                 {invoice.client_email}
               </p>
              )}
              {/* Show phone if it exists */}
              {invoice.client_phone && (
                 <p
                 className={`text-sm mt-1 ${
                   isDarkMode ? "text-gray-300" : "text-gray-700"
                 }`}
               >
                 {invoice.client_phone}
               </p>
              )}
            </div>
            
            <div
              className={`p-4 rounded-xl ${
                isDarkMode ? "bg-gray-700/m-0" : "bg-gray-50"
              }`}
            >
              <label
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Description
              </label>
              <p
                className={`mt-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {invoice.description}
              </p>
            </div>
            <div
              className={`p-6 rounded-xl border-2 ${
                isDarkMode
                  ? "bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-700"
                  : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
              }`}
            >
              <label
                className={`text-sm font-semibold uppercase tracking-wider ${
                  isDarkMode ? "text-blue-300" : "text-blue-700"
                }`}
              >
                Total Amount
              </label>
              <p
                className={`text-3xl font-bold text-right ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {parseFloat(invoice.amount).toFixed(2)} USD
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Payment Status
              </span>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  invoice.status === "PAID"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Payment Button Area */}
          {invoice.status !== "PAID" && (
            <button
              onClick={handlePayment} // Use the new handlePayment function
              disabled={isProcessing} // Button is only clickable when loading is false
              className={`w-full py-4 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5 hover:shadow-xl"
              } text-white`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    ></path>
                  </svg>
                  Proceed To Checkout
                </span>
              )}
            </button>
          )}

          {invoice.status === "PAID" && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 ${
                isDarkMode
                  ? "bg-green-900/30 border border-green-700"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <svg
                className="w-6 h-6 text-green-600 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p
                className={`font-semibold ${
                  isDarkMode ? "text-green-400" : "text-green-800"
                }`}
              >
                Payment Completed
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div
            className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${
              isDarkMode ? "bg-gray-700/30" : "bg-gray-50"
            }`}
          >
            <svg
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <div>
              <p
                className={`text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Secure Payment
              </p>
              <p
                className={`text-xs mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Your payment is processed securely via Flutterwave. Your card
                information is encrypted and never stored on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`mt-6 text-center text-sm ${
            isDarkMode ? "text-gray-500" : "text-gray-600"
          }`}
        >
          <p>Powered by Flutterwave • Secure Card Payments</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
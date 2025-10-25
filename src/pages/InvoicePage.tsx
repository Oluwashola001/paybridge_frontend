// src/pages/InvoicePage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Transak } from "@transak/transak-sdk";
import type { TransakConfig } from "@transak/transak-sdk";
import '../types/transak.d.ts'; // Keep the type patch

// ✅ Define size constants for responsiveness
const MOBILE_WIDTH = '320px'; // Very narrow for small phones
const DESKTOP_WIDTH = '450px'; 
const DESKTOP_HEIGHT = '550px';
const MOBILE_HEIGHT = '500px';

interface Invoice {
  invoice_id: string;
  client_name: string;
  description: string;
  amount: string;
  wallet_address: string;
  status: string;
}

const InvoicePage: React.FC = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // ✅ Define API and Frontend URLs
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  const frontendUrl = 'https://paybridge-frontend-sooty.vercel.app'; 

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/invoices/${invoiceId}`);
        if (res.data && res.data.invoice_id) {
          setInvoice(res.data);
        } else {
          setError("Invoice not found");
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError("Unable to load invoice");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId, apiUrl]); 

  const handlePayment = async () => {
    if (!invoice) {
        setIsProcessing(false);
        return;
    }
    
    // ✅ Determine screen size dynamically
    const isMobile = window.innerWidth < 640; 
    const modalWidth = isMobile ? MOBILE_WIDTH : DESKTOP_WIDTH;
    const modalHeight = isMobile ? MOBILE_HEIGHT : DESKTOP_HEIGHT;

    setIsProcessing(true); 

    try {
      // Step 1: Fetch the key (This is the line causing the CORS error in production)
      const { data } = await axios.get(`${apiUrl}/config/transak-key`);

      // Step 2: Define and launch Transak immediately
      const config: TransakConfig = {
        apiKey: data.apiKey,
        environment: "STAGING",
        widgetUrl: "https://global-stg.transak.com",
        referrer: frontendUrl, // Use Vercel URL
        
        // Core Configuration
        fiatCurrency: "USD",
        fiatAmount: parseFloat(invoice.amount),
        defaultCryptoCurrency: "USDC",
        walletAddress: invoice.wallet_address,
        disableWalletAddressForm: true,
        
        // ✅ Use dynamic size variables
        widgetHeight: modalHeight, 
        widgetWidth: modalWidth,
        
        // Event Handlers
        onSuccess: (orderData: any) => {
          console.log("✅ Transaction Successful:", orderData);
          navigate(`/success/${invoice.invoice_id}`); 
        },
        onCancel: () => {
          console.log("❌ Transaction Cancelled by user inside flow.");
          setIsProcessing(false);
        },
        onClose: () => {
          console.log("Widget Close event received.");
          setIsProcessing(false);
        },
        redirectURL: `${frontendUrl}/success/${invoice.invoice_id}`,
      };

      const transak = new Transak(config);
      transak.init(); // Launch the modal now

    } catch (err) {
      console.error("Error initializing Transak:", err);
      // The network error (CORS) is caught here.
      alert("Payment initiation failed. Please ensure the backend is running and CORS is configured.");
      setIsProcessing(false);
    }
  };

  // ... (keep the rest of the component) ...
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 py-8 px-4 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'
      }`}>
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Invoice Not Found
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {error || "The invoice you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 py-8 px-4 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'
    }`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed top-4 right-4 sm:top-6 sm:right-6 p-3 rounded-xl transition-all duration-300 z-10 ${
          isDarkMode
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
            : 'bg-white hover:bg-gray-100 text-gray-700 shadow-lg'
        }`}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 001-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      {/* Invoice Card */}
      <div className="w-full max-w-lg">
        <div className={`p-8 sm:p-10 rounded-2xl shadow-2xl backdrop-blur-sm border transition-all duration-300 ${
          isDarkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white/80 border-gray-100'
        }`}>
          {/* Header with Icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${
              isDarkMode
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent'
            }`}>
              Invoice Details
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Review and complete payment
            </p>
          </div>

          {/* Invoice Information */}
          <div className="space-y-5 mb-8">
            {/* Invoice ID */}
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Invoice ID
                </span>
              </div>
              <p className={`font-mono text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {invoice.invoice_id}
              </p>
            </div>

            {/* Client Name */}
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Client
                </span>
              </div>
              <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {invoice.client_name}
              </p>
            </div>

            {/* Description */}
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Description
                </span>
              </div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {invoice.description}
              </p>
            </div>

            {/* Amount - Highlighted */}
            <div className={`p-6 rounded-xl border-2 ${
              isDarkMode
                ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-700'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Total Amount
                  </span>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    ${invoice.amount}
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    USD
                  </p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Payment Status
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                invoice.status === 'PAID'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Payment Button */}
          {invoice.status !== 'PAID' && (
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5 hover:shadow-xl'
              } text-white`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Pay Now
                </span>
              )}
            </button>
          )}

          {invoice.status === 'PAID' && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${
              isDarkMode
                ? 'bg-green-900/30 border border-green-700'
                : 'bg-green-50 border border-green-200'
            }`}>
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>
                  Payment Completed
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                  This invoice has been paid
                </p>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${
            isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
          }`}>
            <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Secure Payment
              </p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your payment is processed securely via Transak. Your card information is encrypted and never stored.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-6 text-center text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
          <p>Powered by Transak • Secure Card Payments</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
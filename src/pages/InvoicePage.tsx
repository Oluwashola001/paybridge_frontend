// src/pages/InvoicePage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
// ✅ Import Flutterwave hook and function
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

// ❌ Removed Transak imports, types, type patch, and size constants

// Keep Invoice interface
interface Invoice {
  invoice_id: string; // Used as Flutterwave tx_ref
  client_name: string;
  description: string;
  amount: string; // Flutterwave expects amount as number
  wallet_address: string; // Keep for data, not used directly by Flutterwave checkout
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
  // ✅ State for Flutterwave public key
  const [flutterwavePublicKey, setFlutterwavePublicKey] = useState('');

  // Define API and Frontend URLs
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  const frontendUrl = 'https://paybridge-frontend-sooty.vercel.app'; // Your live Vercel URL

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // ✅ Fetch Invoice AND Flutterwave Public Key
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(""); // Clear previous errors

        // Fetch Invoice Data
        const invoiceRes = await axios.get(`${apiUrl}/invoices/${invoiceId}`);
        if (invoiceRes.data && invoiceRes.data.invoice_id) {
          setInvoice(invoiceRes.data);
        } else {
          setError("Invoice not found");
          setLoading(false);
          return;
        }

        // Fetch Flutterwave Public Key from backend
        try {
            const keyRes = await axios.get(`${apiUrl}/config/flutterwave-key`);
            if (keyRes.data && keyRes.data.publicKey) {
                setFlutterwavePublicKey(keyRes.data.publicKey);
                console.log("Flutterwave Public Key fetched successfully."); // Log success
            } else {
                 throw new Error("Flutterwave public key not found in API response.");
            }
        } catch (keyErr) {
             console.error("Error fetching Flutterwave key:", keyErr);
             setError("Payment configuration error. Cannot fetch Flutterwave key.");
             // No need to setLoading(false) here, finally block handles it
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        // Provide a more generic error if either fetch fails
        setError("Unable to load invoice or payment configuration.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [invoiceId, apiUrl]); // Dependencies for fetching data

  // --- Flutterwave Configuration ---
  const config = {
    public_key: flutterwavePublicKey, // Fetched from backend
    tx_ref: invoice?.invoice_id || Date.now().toString(), // Unique transaction reference (use invoice ID)
    amount: invoice ? parseFloat(invoice.amount) : 0, // Amount from invoice
    currency: 'USD', // Set your desired currency
    payment_options: 'card,ussd,banktransfer', // Customize available payment options
    // redirect_url: `${frontendUrl}/success/${invoiceId}`, // Can be set if needed, but callback is often sufficient
    customer: {
      // Provide customer details - Flutterwave might require these
      email: 'customer-email@example.com', // Placeholder - Ideally get payer email dynamically
      phone_number: '08000000000', // Placeholder - Required by the library's types
      name: invoice?.client_name || 'Paying Client', // Use client name from invoice
    },
    customizations: {
      title: 'PayBridge Invoice Payment', // Title shown on the modal
      description: invoice?.description || 'Payment for services rendered', // Description from invoice
      logo: `${frontendUrl}/logo-paybridge.png`, // URL to your logo in the /public folder
    },
  };

  // ✅ Use the Flutterwave hook
  const handleFlutterwavePayment = useFlutterwave(config);

  // ✅ Function to trigger Flutterwave modal
  const handlePaymentClick = () => {
    // Ensure invoice and public key are loaded before attempting payment
    if (!invoice || !flutterwavePublicKey) {
      alert("Payment cannot be initiated. Invoice details or payment configuration is missing.");
      console.error("Attempted payment without invoice or public key.", { invoice, flutterwavePublicKey });
      return;
    }
    setIsProcessing(true); // Indicate processing started

    handleFlutterwavePayment({
      callback: (response) => {
        console.log("Flutterwave Payment Callback Response:", response);
        // IMPORTANT: Always verify the transaction status on your backend using the webhook
        // before confirming success to the user or navigating away.
        // The webhook is the source of truth.
        if (response.status === 'successful' || response.status === 'completed') {
            console.log("Payment marked as successful by Flutterwave callback.");
            // Ideally, you'd poll your backend here briefly to check if the webhook
            // has updated the status, or rely solely on the webhook update.
            // For now, navigate immediately after callback success.
            navigate(`/success/${invoiceId}`);
        } else {
             // Handle failed, cancelled, or pending statuses from callback
             console.warn("Payment callback status was not successful:", response.status);
             alert(`Payment ${response.status}. Please check your details or try again.`);
             setIsProcessing(false); // Reset processing state on failure/cancel
        }
        closePaymentModal(); // Closes the Flutterwave modal
      },
      onClose: () => {
        console.log('Flutterwave modal closed by user.');
        setIsProcessing(false); // Reset processing state if user closes modal manually
      },
    });
  };
  // --- End Flutterwave ---


  // --- JSX Rendering Logic ---
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

  // Show specific error if Flutterwave key failed to load
  if (!flutterwavePublicKey && !loading) {
     setError("Failed to load payment configuration. Please refresh.")
  }

  if (error || !invoice) { // Error includes missing key now
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
             {error ? "Error Loading" : "Invoice Not Found"}
           </h2>
           <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
             {error || "The invoice data could not be loaded or payment cannot be processed."}
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
          {isDarkMode ? ( <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">...</svg> ) : ( <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">...</svg> )}
        </button>

      {/* Invoice Card */}
      <div className="w-full max-w-lg">
        <div className={`p-8 sm:p-10 rounded-2xl shadow-2xl backdrop-blur-sm border transition-all duration-300 ${
          isDarkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white/80 border-gray-100'
        }`}>
          {/* Header */}
           <div className="flex flex-col items-center mb-8">
             {/* ... Icon ... */}
             <h1 className={`text-3xl font-bold mb-2 ...`}>
               Invoice Details
             </h1>
             <p className={`text-sm ...`}>
               Review and complete payment
             </p>
           </div>

          {/* Invoice Info */}
           <div className="space-y-5 mb-8">
             {/* ... Invoice ID, Client, Description, Amount, Status ... */}
              <p className={`font-mono text-sm ...`}>{invoice.invoice_id}</p>
              <p className={`text-lg font-semibold ...`}>{invoice.client_name}</p>
              <p className={`...`}>{invoice.description}</p>
              <p className={`text-3xl font-bold ...`}>${invoice.amount}</p>
              <span className={`px-4 py-2 ...`}>{invoice.status}</span>
           </div>

          {/* Payment Button */}
          {invoice.status !== 'PAID' && (
            <button
              onClick={handlePaymentClick} // ✅ Use Flutterwave handler
              disabled={isProcessing || !flutterwavePublicKey} // Disable until key loads
              className={`w-full py-4 px-6 rounded-xl font-semibold shadow-lg ... ${
                isProcessing || !flutterwavePublicKey ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 ...'
              } text-white`}
            >
              {isProcessing ? (
                 <span className="flex items-center justify-center gap-2"> {/* Loading */} </span>
              ) : (
                 <span className="flex items-center justify-center gap-2">
                   {/* ✅ Updated Icon and Text */}
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                   Pay Now with Flutterwave
                 </span>
              )}
            </button>
          )}

          {invoice.status === 'PAID' && (
             <div className={`p-4 rounded-xl flex items-center gap-3 ...`}> {/* Paid Status */} </div>
          )}

          {/* Security Notice */}
          <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ...`}>
            {/* ... Icon ... */}
            <div>
               <p className={`text-sm font-medium ...`}>Secure Payment</p>
              <p className={`text-xs mt-1 ...`}>
                {/* ✅ Updated text */}
                Your payment is processed securely via Flutterwave. Your card information is encrypted and never stored on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-6 text-center text-sm ...`}>
          {/* ✅ Updated text */}
          <p>Powered by Flutterwave • Secure Card Payments</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
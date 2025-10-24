// src/pages/InvoicePage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { init } from "@transak/transak-sdk"; // ✅ v4 syntax

interface Invoice {
  invoice_id: string;
  client_name: string;
  description: string;
  amount: number;
  wallet_address: string;
  status: string;
}

const InvoicePage: React.FC = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:4000/api/invoices/${invoiceId}`);

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
  }, [invoiceId]);

  const handlePayment = async () => {
    if (!invoice) return;

    try {
      const { data } = await axios.get("http://localhost:4000/api/config/transak-key");

      const transak = init({
        apiKey: data.apiKey, // ✅ securely fetched from backend
        environment: "STAGING",
        cryptoCurrency: "USDC",
        fiatCurrency: "USD",
        walletAddress: invoice.wallet_address,
        fiatAmount: invoice.amount,
        email: "payer@example.com",
        redirectURL: `${window.location.origin}/success/${invoice.invoice_id}`,
        hostURL: window.location.origin,
        widgetHeight: "650px",
        widgetWidth: "500px",
        themeColor: "0000FF",
      });

      transak.on("TRANSAK_ORDER_SUCCESSFUL", (orderData: any) => {
        console.log("✅ Transaction Successful:", orderData);
        transak.close();
        navigate(`/success/${invoice.invoice_id}`);
      });

      transak.on("TRANSAK_ORDER_CANCELLED", () => {
        console.log("❌ Transaction Cancelled");
        transak.close();
      });

      transak.init();
    } catch (err) {
      console.error("Error initializing Transak:", err);
      alert("Payment system unavailable right now. Please try again.");
    }
  };

  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading invoice...</div>;

  if (error || !invoice)
    return <div className="p-8 text-center text-red-500">{error || "Invoice not found."}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Invoice Details</h1>
        <div className="space-y-2 text-sm">
          <p><strong>Client:</strong> {invoice.client_name}</p>
          <p><strong>Description:</strong> {invoice.description}</p>
          <p><strong>Amount:</strong> ${invoice.amount}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`font-semibold ${
                invoice.status === "PAID" ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {invoice.status}
            </span>
          </p>
        </div>

        <button
          onClick={handlePayment}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default InvoicePage;

// src/pages/admin/AdminDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Invoice {
  id: number; // Database ID is needed for deletion
  invoice_id: string;
  client_name: string;
  description: string;
  amount: string;
  status: string;
  wallet_address: string;
  created_at: string;
}

const AdminDashboardPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- State for the Create Invoice Form ---
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [newInvoiceLink, setNewInvoiceLink] = useState('');
  const [formError, setFormError] = useState('');

  // --- Fetch Invoices ---
  const fetchInvoices = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:4000/api/invoices');
      setInvoices(response.data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // --- Handle Create Invoice ---
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setNewInvoiceLink('');
    if (!clientName || !description || !amount || !walletAddress) {
      setFormError('All fields are required.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:4000/api/invoices', {
        client_name: clientName,
        description: description,
        amount: parseFloat(amount),
        wallet_address: walletAddress,
      });
      if (response.data.success) {
        setNewInvoiceLink(response.data.link);
        fetchInvoices();
        setClientName('');
        setDescription('');
        setAmount('');
        setWalletAddress('');
      } else {
        setFormError(response.data.message || 'Failed to create invoice.');
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
      setFormError('An error occurred. Please try again.');
    }
  };

  // ✅ --- Handle Delete Single Invoice ---
  const handleDeleteInvoice = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this invoice? This cannot be undone.')) {
      try {
        const response = await axios.delete(`http://localhost:4000/api/invoices/${id}`);
        if (response.data.success) {
          fetchInvoices(); // Refresh the list after deletion
        } else {
          alert(`Failed to delete invoice: ${response.data.message}`);
        }
      } catch (err) {
        console.error('Error deleting invoice:', err);
        alert('An error occurred while deleting the invoice.');
      }
    }
  };

  // ✅ --- Handle Clear All History ---
  const handleClearHistory = async () => {
    if (window.confirm('ARE YOU ABSOLUTELY SURE you want to delete ALL invoice history? This is irreversible!')) {
      try {
        const response = await axios.delete('http://localhost:4000/api/invoices');
        if (response.data.success) {
          fetchInvoices(); // Refresh the list (will be empty)
        } else {
          alert(`Failed to clear history: ${response.data.message}`);
        }
      } catch (err) {
        console.error('Error clearing history:', err);
        alert('An error occurred while clearing history.');
      }
    }
  };


  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Create New Invoice Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        {/* ... (keep the form code exactly as before) ... */}
         <h2 className="text-xl font-semibold mb-4 text-gray-700">Create New Invoice</h2>
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-600">Client Name</label>
            <input
              type="text"
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-600">Description</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-600">Amount (USD)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-600">Your Wallet Address (USDC)</label>
            <input
              type="text"
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="e.g., 0xYourWalletAddressHere"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          {newInvoiceLink && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Invoice link generated: </span>
              <input
                type="text"
                readOnly
                value={newInvoiceLink}
                className="mt-1 block w-full bg-green-50 px-2 py-1 border border-green-300 rounded"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Generate Invoice Link
          </button>
        </form>
      </div>

      {/* Invoice List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Invoice History</h2>
             {/* ✅ Clear History Button */}
            <button
                onClick={handleClearHistory}
                disabled={invoices.length === 0}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                    invoices.length > 0
                    ? 'bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                Clear All History
            </button>
        </div>
        {isLoading && <p className="text-gray-500">Loading invoices...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No invoices found.</td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.invoice_id}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.client_name}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${invoice.amount}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(invoice.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {invoice.status === 'PAID' && (
                          <a
                            href={`http://localhost:4000/api/invoices/${invoice.invoice_id}/receipt`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Receipt
                          </a>
                        )}
                        {/* ✅ Delete Button for Each Row */}
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)} // Pass the database ID
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
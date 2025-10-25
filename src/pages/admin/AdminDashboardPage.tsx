// src/pages/admin/AdminDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Invoice {
  id: number;
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
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [newInvoiceLink, setNewInvoiceLink] = useState('');
  const [formError, setFormError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // ✅ Define the API base URL using the env variable
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError('');
    try {
      // ✅ Use apiUrl variable
      const response = await axios.get(`${apiUrl}/invoices`);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]); // Added apiUrl as dependency

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setNewInvoiceLink('');
    if (!clientName || !description || !amount || !walletAddress) {
      setFormError('All fields are required.');
      return;
    }
    try {
      // ✅ Use apiUrl variable
      const response = await axios.post(`${apiUrl}/invoices`, {
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

  const handleDeleteInvoice = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this invoice? This cannot be undone.')) {
      try {
        // ✅ Use apiUrl variable
        const response = await axios.delete(`${apiUrl}/invoices/${id}`);
        if (response.data.success) {
          fetchInvoices();
        } else {
          alert(`Failed to delete invoice: ${response.data.message}`);
        }
      } catch (err) {
        console.error('Error deleting invoice:', err);
        alert('An error occurred while deleting the invoice.');
      }
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('ARE YOU ABSOLUTELY SURE you want to delete ALL invoice history? This is irreversible!')) {
      try {
        // ✅ Use apiUrl variable
        const response = await axios.delete(`${apiUrl}/invoices`);
        if (response.data.success) {
          fetchInvoices();
        } else {
          alert(`Failed to clear history: ${response.data.message}`);
        }
      } catch (err) {
        console.error('Error clearing history:', err);
        alert('An error occurred while clearing history.');
      }
    }
  };

  const handleCopyLink = (link: string) => {
    // Use execCommand for broader compatibility, especially in iFrames
    const textArea = document.createElement("textarea");
    textArea.value = link;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        setCopiedId(link);
        setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    } catch (err) {
        console.error('Failed to copy link: ', err);
        // Optionally show an error message to the user
    }
    document.body.removeChild(textArea);
};


  // ... (keep the rest of the component's return statement - the JSX part) ...
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header with Dark Mode Toggle */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent'
              }`}>
                Admin Dashboard
              </h1>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Create and manage your payment invoices
              </p>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`ml-4 p-3 rounded-xl transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                  : 'bg-white hover:bg-gray-100 text-gray-700 shadow-md'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Create New Invoice Form */}
        <div className={`p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 mb-8 border ${
          isDarkMode
            ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700'
            : 'bg-white/80 backdrop-blur-sm border-gray-100'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className={`text-xl sm:text-2xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Create New Invoice
            </h2>
          </div>

          <form onSubmit={handleCreateInvoice} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="group">
                <label htmlFor="clientName" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Client Name
                </label>
                <input
                  type="text"
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 hover:border-gray-500'
                      : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                  } border`}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="group">
                <label htmlFor="amount" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    $
                  </span>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className={`w-full pl-8 pr-4 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 hover:border-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                    } border`}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="group">
              <label htmlFor="description" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 hover:border-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                } border`}
                placeholder="What is this invoice for?"
                required
              />
            </div>

            <div className="group">
              <label htmlFor="walletAddress" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Your Wallet Address (USDC)
              </label>
              <input
                type="text"
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0xYourWalletAddressHere"
                className={`w-full px-4 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-sm ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 hover:border-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                } border`}
                required
              />
            </div>

            {formError && (
              <div className={`px-4 py-3 rounded-xl text-sm animate-in fade-in duration-200 ${
                isDarkMode
                  ? 'bg-red-900/50 border border-red-700 text-red-200'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {formError}
              </div>
            )}

            {newInvoiceLink && (
              <div className={`px-4 py-4 rounded-xl animate-in slide-in-from-top duration-300 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-700'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
              }`}>
                <div className="flex items-start gap-3">
                  <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold mb-2 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                      Invoice link generated successfully!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        readOnly
                        value={newInvoiceLink}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          isDarkMode
                            ? 'bg-gray-800 border border-green-700 text-gray-200'
                            : 'bg-white border border-green-300 text-gray-700'
                        }`}
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyLink(newInvoiceLink)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        {copiedId === newInvoiceLink ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Copied
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Invoice Link
              </span>
            </button>
          </form>
        </div>

        {/* Invoice History */}
        <div className={`rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border overflow-hidden ${
          isDarkMode
            ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700'
            : 'bg-white/80 backdrop-blur-sm border-gray-100'
        }`}>
          <div className={`p-6 sm:p-8 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className={`text-xl sm:text-2xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    Invoice History
                  </h2>
                  <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {invoices.length} total invoice{invoices.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearHistory}
                disabled={invoices.length === 0}
                className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 justify-center sm:justify-start ${
                  invoices.length > 0
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All History
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Invoice ID</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Client</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amount</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <svg className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No invoices found</p>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Create your first invoice to get started</p>
                          </td>
                        </tr>
                      ) : (
                        invoices.map((invoice) => (
                          <tr key={invoice.id} className={`transition-colors duration-150 ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`text-sm font-mono px-2 py-1 rounded ${isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-100'}`}>
                                {invoice.invoice_id}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{invoice.client_name}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>${invoice.amount}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                invoice.status === 'PAID'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {invoice.status}
                              </span>
                            </td>
                            <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {new Date(invoice.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-3">
                                {invoice.status === 'PAID' && (
                                  <a
                                    href={`http://localhost:4000/api/invoices/${invoice.invoice_id}/receipt`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`font-medium transition-colors duration-150 flex items-center gap-1 ${
                                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                                    }`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Receipt
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDeleteInvoice(invoice.id)}
                                  className={`font-medium transition-colors duration-150 flex items-center gap-1 ${
                                    isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                                  }`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {invoices.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No invoices found</p>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Create your first invoice to get started</p>
                    </div>
                  ) : (
                    invoices.map((invoice) => (
                      <div key={invoice.id} className={`border rounded-xl p-5 hover:shadow-md transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600'
                          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Invoice ID
                            </p>
                            <span className={`text-sm font-mono px-2 py-1 rounded inline-block ${
                              isDarkMode ? 'text-gray-200 bg-gray-600' : 'text-gray-700 bg-gray-100'
                            }`}>
                              {invoice.invoice_id}
                            </span>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            invoice.status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Client
                            </p>
                            <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                              {invoice.client_name}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Amount
                            </p>
                            <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              ${invoice.amount}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Date
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {new Date(invoice.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className={`flex gap-3 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          {invoice.status === 'PAID' && (
                            <a
                              href={`http://localhost:4000/api/invoices/${invoice.invoice_id}/receipt`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Receipt
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
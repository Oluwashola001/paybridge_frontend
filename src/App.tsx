// src/App.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const App: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 text-gray-800'
    }`}>
      
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-6 right-6 p-3 rounded-xl transition-all duration-300 z-10 ${
          isDarkMode 
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 shadow-md' 
            : 'bg-white hover:bg-gray-100 text-gray-700 shadow-lg'
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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 flex items-center justify-center">
        <div className="text-center max-w-4xl">
          
          {/* Main Title */}
          <h1 className={`text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6 ${
            isDarkMode
              ? 'text-white'
              : 'text-gray-900'
          }`}>
            Your Borderless Payment Solution
          </h1>

          {/* Subtitle */}
          <p className={`text-xl sm:text-2xl mb-10 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
            Securely receive international payments and withdraw to your Nigerian bank.
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className={`p-6 rounded-xl shadow-lg transition-transform hover:scale-[1.03] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <svg className={`w-8 h-8 mx-auto mb-3 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Global Cards Accepted</h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Receive payments via Visa, MasterCard, and more.</p>
            </div>

            <div className={`p-6 rounded-xl shadow-lg transition-transform hover:scale-[1.03] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <svg className={`w-8 h-8 mx-auto mb-3 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>No Country Flagging</h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transactions appear as standard digital service charges.</p>
            </div>

            <div className={`p-6 rounded-xl shadow-lg transition-transform hover:scale-[1.03] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <svg className={`w-8 h-8 mx-auto mb-3 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Direct Local Payout</h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Withdraw funds quickly to your Nigerian bank account.</p>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/admin/login')}
              className={`px-8 py-4 rounded-xl text-lg font-semibold shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 focus:ring-offset-gray-900' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
              }`}
            >
              Start Generating Invoices →
            </button>
            <button
              onClick={() => {
                // Future link to documentation or a demo invoice
                window.open('https://transak.com', '_blank'); 
              }}
              className={`px-8 py-4 rounded-xl text-lg font-semibold shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-blue-500 focus:ring-offset-gray-900' 
                  : 'bg-white hover:bg-gray-100 text-gray-700 focus:ring-blue-500'
              }`}
            >
              Learn More
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
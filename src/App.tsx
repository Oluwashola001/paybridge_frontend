import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isVisible, setIsVisible] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        setIsVisible(prev => ({ ...prev, [entry.target.id]: entry.isIntersecting }));
      });
    }, options);

    document.querySelectorAll('[data-reveal]').forEach(el => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogin = () => {
    window.location.href = '/admin/login';
  };

  const features = [
    {
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Global Payment Access",
      description: "Accept payments from clients worldwide with support for all major credit cards and payment methods."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Bank-Level Security",
      description: "Your transactions are protected with enterprise-grade encryption and fraud prevention systems."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Instant Withdrawals",
      description: "Get paid faster with quick withdrawal processing directly to your local bank account."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Seamless Integration",
      description: "Transactions process as standard digital service payments without regional restrictions."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Transparent Pricing",
      description: "Know exactly what you'll receive with our clear fee structure and competitive rates."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "24/7 Support",
      description: "Our dedicated support team is always ready to help you resolve any payment issues."
    }
  ];

  const stats = [
    { value: "150+", label: "Countries Supported" },
    { value: "99.9%", label: "Uptime Guarantee" },
    { value: "24/7", label: "Customer Support" },
    { value: "$50M+", label: "Processed Annually" }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100' 
        : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 text-gray-900'
    }`}>
      
      {/* Header with Logo and Menu */}
      <header className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-sm transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo with Text */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo-paybridge.png" 
              alt="PayBridge Logo" 
              className="h-10 w-10 object-cover rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className={`text-xl sm:text-2xl font-bold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              PAYBRIDGE
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 sm:gap-4">
            {/* Admin Login Button */}
            <button
              onClick={handleLogin}
              className="px-4 sm:px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              Admin Login
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-full transition-all duration-300 backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 shadow-lg' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={toggleMobileMenu}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t ${
            isDarkMode ? 'border-gray-800 bg-gray-900/95' : 'border-gray-200 bg-white/95'
          } backdrop-blur-sm`}>
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => {
                  handleLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                Admin Login
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 sm:pt-8 sm:pb-40">
          <div className="text-center">
            
            {/* Animated Badge */}
            <div 
              id="badge"
              data-reveal
              className={`inline-flex items-center px-4 py-2 rounded-full mb-8 transition-all duration-700 ${
                isVisible.badge ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              } ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-300 border border-gray-700' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Trusted by Freelancers Worldwide
            </div>

            {/* Main Heading */}
            <h1 
              id="heading"
              data-reveal
              className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-tight mb-6 transition-all duration-700 delay-100 ${
                isVisible.heading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Payment Solutions for
              <span className="block mt-2 text-blue-600 text-4xl sm:text-5xl lg:text-6xl">
                Global Freelancers
              </span>
            </h1>

            {/* Subtitle */}
            <p 
              id="subtitle"
              data-reveal
              className={`text-xl sm:text-2xl lg:text-3xl mb-12 max-w-3xl mx-auto transition-all duration-700 delay-200 ${
                isVisible.subtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Accept international payments seamlessly and withdraw funds directly to your local bank account
            </p>

            {/* CTA Buttons */}
            <div 
              id="cta-buttons"
              data-reveal
              className={`flex flex-col sm:flex-row justify-center gap-4 mb-16 transition-all duration-700 delay-300 ${
                isVisible['cta-buttons'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <button
                onClick={handleLogin}
                className="group relative px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white shadow-xl"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Go To Dashboard
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              
              <button
                className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                    : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-lg'
                }`}
              >
                Watch Demo
              </button>
            </div>

            {/* Stats Bar */}
            <div 
              id="stats"
              data-reveal
              className={`grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto transition-all duration-700 delay-400 ${
                isVisible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className={`p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                    isDarkMode 
                      ? 'bg-gray-800/60 border border-gray-700' 
                      : 'bg-white/80 border border-gray-200 shadow-lg'
                  }`}
                >
                  <div className={`text-3xl sm:text-4xl font-bold mb-2 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-10 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`} />
          <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-10 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`} />
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-24 ${
        isDarkMode ? 'bg-gray-900/50' : 'bg-white/50'
      } backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div 
            id="features-header"
            data-reveal
            className={`text-center mb-16 transition-all duration-700 ${
              isVisible['features-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className={`text-4xl sm:text-5xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Everything You Need to Get Paid
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Powerful features designed specifically for freelancers and independent professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                id={`feature-${index}`}
                data-reveal
                className={`group p-8 rounded-2xl transition-all duration-700 hover:scale-105 ${
                  isVisible[`feature-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } ${
                  isDarkMode 
                    ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-lg hover:shadow-xl'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 transition-all duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            id="final-cta"
            data-reveal
            className={`relative overflow-hidden rounded-3xl p-12 sm:p-16 text-center transition-all duration-700 bg-blue-600 ${
              isVisible['final-cta'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of freelancers who trust us with their international payments
            </p>
            <button
              onClick={handleLogin}
              className="group px-8 py-4 bg-white text-blue-600 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-xl"
            >
              <span className="flex items-center justify-center">
                Login To Dashboard
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>

            {/* Decorative circles */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`py-8 border-t ${
        isDarkMode 
          ? 'border-gray-800 bg-gray-900/50' 
          : 'border-gray-200 bg-white/50'
      } backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            © 2025 Your Payment Solution. Empowering freelancers worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
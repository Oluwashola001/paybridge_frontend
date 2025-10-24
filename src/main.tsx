import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import InvoicePage from "./pages/InvoicePage";
import SuccessPage from "./pages/SuccessPage";
// ✅ Import the new admin page components
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<App />} />
        <Route path="/invoice/:invoiceId" element={<InvoicePage />} />
        <Route path="/success/:invoiceId" element={<SuccessPage />} />

        {/* ✅ Admin Routes Added */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
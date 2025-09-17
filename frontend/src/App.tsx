import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Index from "@/pages/Index";
import Search from "@/pages/Search";
import Auth from "@/pages/Auth";
import PropertyDetails from "@/pages/PropertyDetails";
import UserDashboard from "@/pages/UserDashboard";
import OwnerDashboard from "@/pages/OwnerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Dashboard from "@/pages/Dashboard";
import HelpCenter from "@/pages/HelpCenter";
import ContactUs from "@/pages/ContactUs";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import NotFound from "@/pages/NotFound";

// ⚡ Query client
const queryClient = new QueryClient();

const API_URL = import.meta.env.VITE_API_URL || "https://smartrenter1.onrender.com /api";

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // Fetch all properties from backend
  // ----------------------------
  const fetchProperties = async () => {
    try {
      const res = await axios.get(`${API_URL}/properties`);
      setProperties(res.data.properties || []);
      console.log("✅ Properties fetched:", res.data);
    } catch (err: any) {
      console.error("❌ Fetch properties failed:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // ----------------------------
  // Property CRUD APIs
  // ----------------------------
  const addProperty = async (propertyData: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/properties`, propertyData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties([...properties, res.data.property]);
    } catch (err: any) {
      console.error(err.response?.data?.message || "Add property failed");
    }
  };

  const updateProperty = async (id: string, propertyData: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_URL}/properties/${id}`, propertyData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(properties.map((p) => (p._id === id ? res.data.property : p)));
    } catch (err: any) {
      console.error(err.response?.data?.message || "Update property failed");
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(properties.filter((p) => p._id !== id));
    } catch (err: any) {
      console.error(err.response?.data?.message || "Delete property failed");
    }
  };

  if (loading)
    return <div className="text-center mt-20">Loading frontend properties...</div>;

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<Search />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        <Route
          path="/search"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard user={user} logout={logout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <OwnerDashboard
                user={user}
                properties={properties}
                addProperty={addProperty}
                updateProperty={updateProperty}
                deleteProperty={deleteProperty}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

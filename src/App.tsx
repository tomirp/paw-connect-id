import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
// import Directory from "./pages/Directory";
import MerchantDetail from "./pages/MerchantDetail";
import Booking from "./pages/Booking";
import Chat from "./pages/Chat";
import MerchantDashboard from "./pages/MerchantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Search from "./pages/Search";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Notifications from "./components/Notifications";
import { AuthProvider, RequireRole } from "./hooks/useAuth";
import SetupMerchant from "./pages/SetupMerchant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Notifications />
          <ScrollToTop />
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/direktori" element={<Navigate to="/search" replace />} />
            <Route path="/tentang" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/search" element={<Search />} />
            <Route path="/cart" element={<RequireRole allow={["user","merchant","admin"]} fallback={<NotFound />}><Cart /></RequireRole>} />
            <Route path="/checkout" element={<RequireRole allow={["user","merchant","admin"]} fallback={<NotFound />}><Checkout /></RequireRole>} />
            <Route path="/profile" element={<RequireRole allow={["user","merchant","admin"]} fallback={<NotFound />}><Profile /></RequireRole>} />
            <Route path="/merchant/:id" element={<MerchantDetail />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/dashboard/merchant" element={<RequireRole allow={["merchant","admin"]} fallback={<NotFound />}><MerchantDashboard /></RequireRole>} />
            <Route path="/dashboard/admin" element={<RequireRole allow={["admin"]} fallback={<NotFound />}><AdminDashboard /></RequireRole>} />
            <Route path="/__setup/merchant" element={<SetupMerchant />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

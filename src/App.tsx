import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Directory from "./pages/Directory";
import MerchantDetail from "./pages/MerchantDetail";
import Booking from "./pages/Booking";
import Chat from "./pages/Chat";
import MerchantDashboard from "./pages/MerchantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/direktori" element={<Directory />} />
          <Route path="/merchant/:id" element={<MerchantDetail />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/dashboard/merchant" element={<MerchantDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

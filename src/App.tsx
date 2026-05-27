import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Layout/Navigation";
import ScrollToTop from "@/components/Layout/ScrollToTop";
import LangLayout from "@/components/Layout/LangLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import WellnessGeni from "./pages/WellnessGeni";
import PartnerWithUs from "./pages/PartnerWithUs";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Interactive from "./pages/Interactive";
import Ecosystem from "./pages/Ecosystem";
import VideoLibrary from "./pages/VideoLibrary";
import VideoDetail from "./pages/VideoDetail";
import Clinics from "./pages/industries/Clinics";
import RealEstate from "./pages/industries/RealEstate";
import Wellness from "./pages/industries/Wellness";
import NotFound from "./pages/NotFound";
import CookieConsentBanner from "@/components/UI/CookieConsentBanner";

const queryClient = new QueryClient();

// Reusable route tree — mounted twice (English at root, others under /:lang)
const AppRoutes = () => (
  <Routes>
    <Route index element={<Home />} />
    <Route path="interactive" element={<Interactive />} />
    <Route path="ecosystem" element={<Ecosystem />} />
    <Route path="about" element={<About />} />
    <Route path="projects" element={<Projects />} />
    <Route path="wellnessgeni" element={<WellnessGeni />} />
    <Route path="partner" element={<PartnerWithUs />} />
    <Route path="pricing" element={<Pricing />} />
    <Route path="contact" element={<Contact />} />
    <Route path="videos" element={<VideoLibrary />} />
    <Route path="videos/:slug" element={<VideoDetail />} />
    <Route path="industries/clinics" element={<Clinics />} />
    <Route path="industries/real-estate" element={<RealEstate />} />
    <Route path="industries/wellness" element={<Wellness />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              <Routes>
                {/* Language-prefixed routes — fr, es, de, pt, ca */}
                <Route path="/:lang(fr|es|de|pt|ca)/*" element={<LangLayout />}>
                  <Route path="*" element={<AppRoutes />} />
                </Route>
                {/* Default (English) routes at root */}
                <Route path="/*" element={<AppRoutes />} />
              </Routes>
            </main>
          </div>
          <CookieConsentBanner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

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
import VideoCategory from "./pages/VideoCategory";
import TopicHub from "./pages/TopicHub";

import Clinics from "./pages/industries/Clinics";
import RealEstate from "./pages/industries/RealEstate";
import Wellness from "./pages/industries/Wellness";
import NotFound from "./pages/NotFound";
import CookieConsentBanner from "@/components/UI/CookieConsentBanner";
// Note: removed secondary IsabellaConcierge. All Isabella interactions
// route to the single animated/voice-enabled Isabella on Home.

const queryClient = new QueryClient();

const LANG_PREFIXES = ['fr', 'es', 'de', 'pt', 'ca'] as const;

const SiteRoutes = () => (
  <>
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
    <Route path="videos/category/:categorySlug" element={<VideoCategory />} />
    <Route path="videos/:slug" element={<VideoDetail />} />
    <Route path="topics/:hubSlug" element={<TopicHub />} />

    <Route path="industries/clinics" element={<Clinics />} />
    <Route path="industries/real-estate" element={<RealEstate />} />
    <Route path="industries/wellness" element={<Wellness />} />
    <Route path="*" element={<NotFound />} />
  </>
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
                {/* English at root */}
                <Route path="/">{SiteRoutes()}</Route>
                {/* Per-language prefixed routes */}
                {LANG_PREFIXES.map((lang) => (
                  <Route key={lang} path={`/${lang}`} element={<LangLayout />}>
                    {SiteRoutes()}
                  </Route>
                ))}
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

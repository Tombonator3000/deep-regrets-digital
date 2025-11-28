import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AudioProvider } from "@/context/AudioContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { HintProvider, HintPopup } from "@/components/game/ContextualHints";

const queryClient = new QueryClient();

const App = () => (
  <LanguageProvider>
    <AudioProvider>
      <HintProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <HintPopup />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HintProvider>
    </AudioProvider>
  </LanguageProvider>
);

export default App;

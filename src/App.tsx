import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from 'wagmi';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MobileResponsiveWrapper from "./components/mobile/MobileResponsiveWrapper";
import ErrorBoundary from "./components/ErrorBoundary";
import { config } from "./lib/wagmi";

// Lazy load pages for better performance
const GamePage = lazy(() => import("./pages/game/GamePage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const SocialLeaderboardPage = lazy(() => import("./pages/SocialLeaderboardPage"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const LearnWeb3Page = lazy(() => import("./pages/LearnWeb3Page"));
const ReactiveQuestPage = lazy(() => import("./pages/ReactiveQuestPage"));
const InteractiveLearningPage = lazy(() => import("./pages/InteractiveLearningPage"));
const EnhancedRewardsPage = lazy(() => import("./pages/EnhancedRewardsPage"));
const MockDataDemo = lazy(() => import("./pages/MockDataDemo"));

      // Enhanced features - lazy loaded
      const CareerPathSystem = lazy(() => import("./components/career/CareerPathSystem"));
      const AnalyticsDashboard = lazy(() => import("./components/analytics/AnalyticsDashboard"));
      const ReactiveAnalyticsDashboard = lazy(() => import("./components/analytics/ReactiveAnalyticsDashboard"));
      const CommunityDashboard = lazy(() => import("./components/community/CommunityDashboard"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white text-lg">Loading Avalanche Rush...</p>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<MobileResponsiveWrapper><Index /></MobileResponsiveWrapper>} />
                <Route path="/play" element={<MobileResponsiveWrapper><GamePage /></MobileResponsiveWrapper>} />
                <Route path="/game" element={<MobileResponsiveWrapper><GamePage /></MobileResponsiveWrapper>} />
                <Route path="/leaderboard" element={<MobileResponsiveWrapper><LeaderboardPage /></MobileResponsiveWrapper>} />
                <Route path="/social-leaderboard" element={<MobileResponsiveWrapper><SocialLeaderboardPage /></MobileResponsiveWrapper>} />
                <Route path="/tournaments" element={<MobileResponsiveWrapper><SocialLeaderboardPage /></MobileResponsiveWrapper>} />
                <Route path="/achievements" element={<MobileResponsiveWrapper><AchievementsPage /></MobileResponsiveWrapper>} />
                <Route path="/learn" element={<MobileResponsiveWrapper><LearnWeb3Page /></MobileResponsiveWrapper>} />
                <Route path="/learn-web3" element={<MobileResponsiveWrapper><LearnWeb3Page /></MobileResponsiveWrapper>} />
                <Route path="/reactive-quest" element={<MobileResponsiveWrapper><ReactiveQuestPage /></MobileResponsiveWrapper>} />
                <Route path="/interactive-learning" element={<MobileResponsiveWrapper><InteractiveLearningPage /></MobileResponsiveWrapper>} />
                <Route path="/enhanced-rewards" element={<MobileResponsiveWrapper><EnhancedRewardsPage /></MobileResponsiveWrapper>} />
                <Route path="/mock-data" element={<MobileResponsiveWrapper><MockDataDemo /></MobileResponsiveWrapper>} />
                <Route path="/demo" element={<MobileResponsiveWrapper><MockDataDemo /></MobileResponsiveWrapper>} />
                
                {/* Enhanced Features Routes */}
                <Route path="/career" element={<MobileResponsiveWrapper><CareerPathSystem /></MobileResponsiveWrapper>} />
                <Route path="/career-paths" element={<MobileResponsiveWrapper><CareerPathSystem /></MobileResponsiveWrapper>} />
        <Route path="/analytics" element={<MobileResponsiveWrapper><AnalyticsDashboard /></MobileResponsiveWrapper>} />
        <Route path="/reactive-analytics" element={<MobileResponsiveWrapper><ReactiveAnalyticsDashboard /></MobileResponsiveWrapper>} />
        <Route path="/dashboard" element={<MobileResponsiveWrapper><AnalyticsDashboard /></MobileResponsiveWrapper>} />
                <Route path="/community" element={<MobileResponsiveWrapper><CommunityDashboard /></MobileResponsiveWrapper>} />
                <Route path="/governance" element={<MobileResponsiveWrapper><CommunityDashboard /></MobileResponsiveWrapper>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<MobileResponsiveWrapper><NotFound /></MobileResponsiveWrapper>} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </ErrorBoundary>
);

export default App;

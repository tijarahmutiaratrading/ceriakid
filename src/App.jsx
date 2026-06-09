import React, { useEffect, Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import ErrorBoundary from '@/components/ErrorBoundary'
import RouteErrorBoundary from '@/components/RouteErrorBoundary'
import PageLoader from '@/components/PageLoader'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/pixel';
import { logPageView } from '@/lib/pageViewTracker';
import PageNotFound from './lib/PageNotFound';
import { captureReferralFromUrl } from '@/lib/referralTracker';
import AppLayout from '@/components/AppLayout';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/LanguageContext';
import { AgeGroupProvider } from '@/lib/AgeGroupContext';
import { SelectedChildProvider } from '@/lib/SelectedChildContext';

// Eager-load: kritikal untuk first paint (public pages + main shell)
import Landing from '@/pages/Landing';
import Home from '@/pages/Home';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Contact from '@/pages/Contact';
import ThankYou from '@/pages/ThankYou';

// Lazy-load: admin pages — admin sahaja akses, kurangkan bundle untuk user biasa
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const GameAnalytics = lazy(() => import('@/pages/GameAnalytics'));
const GameDatabase = lazy(() => import('@/pages/GameDatabase'));

// Lazy-load: secondary pages — boleh loaded on-demand
const ClientDashboard = lazy(() => import('@/pages/ClientDashboard'));
const ChildrenProfiles = lazy(() => import('@/pages/ChildrenProfiles'));
const ParentDashboard = lazy(() => import('@/pages/ParentDashboard'));
const FriendsList = lazy(() => import('@/pages/FriendsList'));
const Challenges = lazy(() => import('@/pages/Challenges'));
const Scoreboard = lazy(() => import('@/pages/Scoreboard'));
const BuyCredits = lazy(() => import('@/pages/BuyCredits'));
const Syllabus = lazy(() => import('@/pages/Syllabus'));
const Affiliate = lazy(() => import('@/pages/Affiliate'));
const KafaHub = lazy(() => import('@/pages/KafaHub'));

// Lazy-load: AI pages — heavy markdown/chat dependencies
const AIAssistant = lazy(() => import('@/pages/AIAssistant'));
const StoryGenerator = lazy(() => import('@/pages/StoryGenerator'));
const BBMGenerator = lazy(() => import('@/pages/BBMGenerator'));
const QuizAI = lazy(() => import('@/pages/QuizAI'));

// Lazy-load: games hub & list (boleh ada banyak)
const GamesHub = lazy(() => import('@/pages/GamesHub'));
const GamesSubjek = lazy(() => import('@/pages/GamesSubjek'));
const GamesList = lazy(() => import('@/pages/GamesList'));
const MiniGamesList = lazy(() => import('@/pages/MiniGamesList'));

// Lazy-load: game players — load bila user nak main sahaja
const GamePlayer = lazy(() => import('@/pages/GamePlayer'));
const MiniGamePlayground = lazy(() => import('@/pages/MiniGamePlayground'));
const DrawingStudio = lazy(() => import('@/pages/DrawingStudio'));
const ABCGame = lazy(() => import('@/pages/ABCGame'));
const NumberGame = lazy(() => import('@/pages/NumberGame'));
const QuizGame = lazy(() => import('@/pages/QuizGame'));
const ShapesGame = lazy(() => import('@/pages/ShapesGame'));
const StoryKid = lazy(() => import('@/pages/StoryKid'));

// Lazy-load: Interactive Games (besar — three.js, physics, etc.)
const MemoryGame = lazy(() => import('@/pages/games/MemoryGame'));
const DragDropGame = lazy(() => import('@/pages/games/DragDropGame'));
const WordBuilderGame = lazy(() => import('@/pages/games/WordBuilderGame'));
const SortingGame = lazy(() => import('@/pages/games/SortingGame'));
const TileMatchGame = lazy(() => import('@/pages/games/TileMatchGame'));
const StoryAdventureGame = lazy(() => import('@/pages/games/StoryAdventureGame'));
const PhysicsGame = lazy(() => import('@/pages/games/PhysicsGame'));
const TracingGameGamified = lazy(() => import('@/pages/games/TracingGameGamified'));

import OfflineBanner from '@/components/OfflineBanner';
import AdminGuard from '@/components/AdminGuard';

const PixelPageViewTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageView();
    captureReferralFromUrl();
    // Log to our own analytics — fire-and-forget, silent fail
    logPageView(location.pathname);
  }, [location.pathname, location.search]);
  return null;
};

const AuthenticatedAppWithChild = () => {
  return (
    <SelectedChildProvider>
      <PixelPageViewTracker />
      <AuthenticatedApp />
    </SelectedChildProvider>
  );
};

// Helper: wrap route element dengan suspense + per-route error boundary
const lazyRoute = (Component) => (
  <RouteErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  </RouteErrorBoundary>
);

const AuthenticatedApp = () => {
  const authContext = useAuth();
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = authContext || {};

  if (isLoadingPublicSettings || isLoadingAuth) {
    return <PageLoader />;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin?.();
      return null;
    }
  }

  return (
    <LanguageProvider>
      <AgeGroupProvider>
        <Routes>
          {/* Public pages - NO sidebar (eager loaded) */}
          <Route path="/" element={<Landing />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/thank-you" element={<ThankYou />} />

          {/* Admin pages - lazy loaded */}
          <Route path="/admin-dashboard" element={<AdminGuard>{lazyRoute(AdminDashboard)}</AdminGuard>} />
          <Route path="/game-analytics" element={<AdminGuard>{lazyRoute(GameAnalytics)}</AdminGuard>} />
          <Route path="/game-database" element={<AdminGuard>{lazyRoute(GameDatabase)}</AdminGuard>} />

          {/* Authenticated user pages - WITH sidebar (lazy loaded) */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<RouteErrorBoundary><Home /></RouteErrorBoundary>} />
            <Route path="/settings" element={lazyRoute(ClientDashboard)} />
            <Route path="/children-profiles" element={lazyRoute(ChildrenProfiles)} />
            <Route path="/games-hub" element={lazyRoute(GamesHub)} />
            <Route path="/games-subjek" element={lazyRoute(GamesSubjek)} />
            <Route path="/kafa" element={lazyRoute(KafaHub)} />
            <Route path="/games/:category" element={lazyRoute(GamesList)} />
            <Route path="/mini-games/:type" element={lazyRoute(MiniGamesList)} />
            <Route path="/parent-dashboard" element={lazyRoute(ParentDashboard)} />
            <Route path="/friends" element={lazyRoute(FriendsList)} />
            <Route path="/challenges" element={lazyRoute(Challenges)} />
            <Route path="/scoreboard" element={lazyRoute(Scoreboard)} />
            <Route path="/buy-credits" element={lazyRoute(BuyCredits)} />
            <Route path="/syllabus" element={lazyRoute(Syllabus)} />
            <Route path="/ai-assistant" element={lazyRoute(AIAssistant)} />
            <Route path="/story-generator" element={lazyRoute(StoryGenerator)} />
            <Route path="/bbm-generator" element={lazyRoute(BBMGenerator)} />
            <Route path="/quiz-ai" element={lazyRoute(QuizAI)} />
            <Route path="/affiliate" element={lazyRoute(Affiliate)} />
            <Route path="/story-kid" element={lazyRoute(StoryKid)} />
          </Route>

          {/* Game-play / fullscreen pages - lazy loaded */}
          <Route path="/drawing" element={lazyRoute(DrawingStudio)} />
          <Route path="/mini-games/:categoryId/play/:gameId" element={lazyRoute(MiniGamePlayground)} />
          <Route path="/play/:category/:index" element={lazyRoute(GamePlayer)} />
          <Route path="/abc" element={lazyRoute(ABCGame)} />
          <Route path="/numbers" element={lazyRoute(NumberGame)} />
          <Route path="/quiz" element={lazyRoute(QuizGame)} />
          <Route path="/shapes" element={lazyRoute(ShapesGame)} />
          <Route path="/games/memory" element={lazyRoute(MemoryGame)} />
          <Route path="/games/dragdrop" element={lazyRoute(DragDropGame)} />
          <Route path="/games/wordbuilder" element={lazyRoute(WordBuilderGame)} />
          <Route path="/games/sorting" element={lazyRoute(SortingGame)} />
          <Route path="/games/tilematch" element={lazyRoute(TileMatchGame)} />
          <Route path="/games/story" element={lazyRoute(StoryAdventureGame)} />
          <Route path="/games/physics" element={lazyRoute(PhysicsGame)} />
          <Route path="/games/tracing" element={lazyRoute(TracingGameGamified)} />

          {/* Catch all */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AgeGroupProvider>
    </LanguageProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <QueryClientProvider client={queryClientInstance}>
          <AuthProvider>
            <OfflineBanner />
            <AuthenticatedAppWithChild />
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App
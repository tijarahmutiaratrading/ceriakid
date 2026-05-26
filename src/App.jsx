import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import ErrorBoundary from '@/components/ErrorBoundary'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/pixel';
import PageNotFound from './lib/PageNotFound';
import { captureReferralFromUrl } from '@/lib/referralTracker';
import AppLayout from '@/components/AppLayout';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/LanguageContext';
import { AgeGroupProvider } from '@/lib/AgeGroupContext';
import { SelectedChildProvider } from '@/lib/SelectedChildContext';

import Landing from '@/pages/Landing';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Contact from '@/pages/Contact';
import Home from '@/pages/Home';
import AdminDashboard from '@/pages/AdminDashboard';
import GameAnalytics from '@/pages/GameAnalytics';
import GameDatabase from '@/pages/GameDatabase';
import ClientDashboard from '@/pages/ClientDashboard';
import GamesList from '@/pages/GamesList';

import GamePlayer from '@/pages/GamePlayer';
import GamesHub from '@/pages/GamesHub';
import MiniGamesList from '@/pages/MiniGamesList';
import MiniGamePlayground from '@/pages/MiniGamePlayground';
import ParentDashboard from '@/pages/ParentDashboard';
import FriendsList from '@/pages/FriendsList';
import Challenges from '@/pages/Challenges';
import DrawingStudio from '@/pages/DrawingStudio';
import ABCGame from '@/pages/ABCGame';
import NumberGame from '@/pages/NumberGame';
import QuizGame from '@/pages/QuizGame';
import ShapesGame from '@/pages/ShapesGame';
import Scoreboard from '@/pages/Scoreboard';
import ChildrenProfiles from '@/pages/ChildrenProfiles';
import StoryKid from '@/pages/StoryKid';
import ThankYou from '@/pages/ThankYou';
import BuyCredits from '@/pages/BuyCredits';
import AIAssistant from '@/pages/AIAssistant';
import StoryGenerator from '@/pages/StoryGenerator';
import BBMGenerator from '@/pages/BBMGenerator';
import QuizAI from '@/pages/QuizAI';
import Syllabus from '@/pages/Syllabus';
import Affiliate from '@/pages/Affiliate';

// Interactive Games
import MemoryGame from '@/pages/games/MemoryGame';
import DragDropGame from '@/pages/games/DragDropGame';
import WordBuilderGame from '@/pages/games/WordBuilderGame';
import SortingGame from '@/pages/games/SortingGame';
import TileMatchGame from '@/pages/games/TileMatchGame';
import StoryAdventureGame from '@/pages/games/StoryAdventureGame';
import PhysicsGame from '@/pages/games/PhysicsGame';
import TracingGameGamified from '@/pages/games/TracingGameGamified';

import OfflineBanner from '@/components/OfflineBanner';
import AdminGuard from '@/components/AdminGuard';

const PixelPageViewTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageView();
    // Capture referral code dari URL bila page bertukar (?ref=CODE)
    captureReferralFromUrl();
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

const AuthenticatedApp = () => {
  const authContext = useAuth();
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = authContext || {};

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🎓</div>
          <div className="w-8 h-8 border-4 border-game-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
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
          {/* Public pages - NO sidebar */}
          <Route path="/" element={<Landing />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/thank-you" element={<ThankYou />} />

          {/* Admin pages - have own layout, NO shared sidebar */}
          <Route path="/admin-dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/game-analytics" element={<AdminGuard><GameAnalytics /></AdminGuard>} />
          <Route path="/game-database" element={<AdminGuard><GameDatabase /></AdminGuard>} />

          {/* Authenticated user pages - WITH sidebar (navigation/hub pages) */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/settings" element={<ClientDashboard />} />
            <Route path="/children-profiles" element={<ChildrenProfiles />} />
            <Route path="/games-hub" element={<GamesHub />} />
            <Route path="/games/:category" element={<GamesList />} />
            <Route path="/mini-games/:type" element={<MiniGamesList />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/friends" element={<FriendsList />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/scoreboard" element={<Scoreboard />} />
            <Route path="/buy-credits" element={<BuyCredits />} />
            <Route path="/syllabus" element={<Syllabus />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/story-generator" element={<StoryGenerator />} />
            <Route path="/bbm-generator" element={<BBMGenerator />} />
            <Route path="/quiz-ai" element={<QuizAI />} />
            <Route path="/affiliate" element={<Affiliate />} />
          </Route>

          {/* Game-play / fullscreen pages - NO sidebar (immersive experience) */}
          <Route path="/story-kid" element={<StoryKid />} />
          <Route path="/mini-games/:categoryId/play/:gameId" element={<MiniGamePlayground />} />
          <Route path="/play/:category/:index" element={<GamePlayer />} />
          <Route path="/drawing" element={<DrawingStudio />} />
          <Route path="/abc" element={<ABCGame />} />
          <Route path="/numbers" element={<NumberGame />} />
          <Route path="/quiz" element={<QuizGame />} />
          <Route path="/shapes" element={<ShapesGame />} />
          <Route path="/games/memory" element={<MemoryGame />} />
          <Route path="/games/dragdrop" element={<DragDropGame />} />
          <Route path="/games/wordbuilder" element={<WordBuilderGame />} />
          <Route path="/games/sorting" element={<SortingGame />} />
          <Route path="/games/tilematch" element={<TileMatchGame />} />
          <Route path="/games/story" element={<StoryAdventureGame />} />
          <Route path="/games/physics" element={<PhysicsGame />} />
          <Route path="/games/tracing" element={<TracingGameGamified />} />

          {/* Catch all */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AgeGroupProvider>
    </LanguageProvider>
  );
};

function App() {
  // NOTE: Aggressive localStorage purge removed — was deleting user offline progress, 
  // selected child, language preference, etc on every reload.
  // React Query cache resets naturally on full page reload.

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
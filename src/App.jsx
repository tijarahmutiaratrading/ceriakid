import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/LanguageContext';
import { AgeGroupProvider } from '@/lib/AgeGroupContext';
import { SelectedChildProvider } from '@/lib/SelectedChildContext';

import Landing from '@/pages/Landing';
import Home from '@/pages/Home';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminGameManager from '@/pages/AdminGameManager';
import GameAnalytics from '@/pages/GameAnalytics';
import GameDatabase from '@/pages/GameDatabase';
import ClientDashboard from '@/pages/ClientDashboard';
import GamesList from '@/pages/GamesList';

import GamePlayer from '@/pages/GamePlayer';
import GamesHub from '@/pages/GamesHub';
import MiniGamesList from '@/pages/MiniGamesList';
import BBMHub from '@/pages/BBMHub';
import AdminBBMGenerator from '@/pages/AdminBBMGenerator';
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

const AuthenticatedAppWithChild = () => {
  return (
    <SelectedChildProvider>
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
          {/* Public pages - check if not authenticated */}
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/admin-dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin-game-manager" element={<AdminGuard><AdminGameManager /></AdminGuard>} />
          <Route path="/game-analytics" element={<AdminGuard><GameAnalytics /></AdminGuard>} />
          <Route path="/game-database" element={<AdminGuard><GameDatabase /></AdminGuard>} />

          <Route path="/settings" element={<ClientDashboard />} />
          <Route path="/children-profiles" element={<ChildrenProfiles />} />
          <Route path="/story-kid" element={<StoryKid />} />
          <Route path="/games-hub" element={<GamesHub />} />
          <Route path="/mini-games/:type" element={<MiniGamesList />} />
          <Route path="/bbm" element={<BBMHub />} />
          <Route path="/admin-bbm-generator" element={<AdminGuard><AdminBBMGenerator /></AdminGuard>} />
          <Route path="/games/:category" element={<GamesList />} />
          <Route path="/play/:category/:index" element={<GamePlayer />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/friends" element={<FriendsList />} />
          <Route path="/challenges" element={<Challenges />} />
          
          {/* Drawing Studio */}
          <Route path="/drawing" element={<DrawingStudio />} />
          
          {/* Legacy games */}
          <Route path="/abc" element={<ABCGame />} />
          <Route path="/numbers" element={<NumberGame />} />
          <Route path="/quiz" element={<QuizGame />} />
          <Route path="/shapes" element={<ShapesGame />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          
          {/* Interactive Games */}
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
  useEffect(() => {
    // Clear stale cache data on app load
    const clearStaleData = () => {
      // Clear old localStorage keys yang outdated
      const keysToPreserve = ['ck_auth_token', 'ck_user_preference', 'ck_offline_data'];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToPreserve.some(k => key.includes(k)) && key.startsWith('ck_')) {
          localStorage.removeItem(key);
        }
      }
      // Clear sessionStorage completely (session-specific data)
      sessionStorage.clear();
      // Invalidate all React Query cache
      queryClientInstance.clear();
    };
    
    clearStaleData();
  }, []);

  return (
    <Router>
      <QueryClientProvider client={queryClientInstance}>
        <AuthProvider>
          <OfflineBanner />
          <AuthenticatedAppWithChild />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App
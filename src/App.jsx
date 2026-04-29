import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/LanguageContext';
import { AgeGroupProvider } from '@/lib/AgeGroupContext';

import Landing from '@/pages/Landing';
import Home from '@/pages/Home';
import AdminDashboard from '@/pages/AdminDashboard';
import ClientDashboard from '@/pages/ClientDashboard';
import GamesList from '@/pages/GamesList';
import GamePlayer from '@/pages/GamePlayer';
import ParentDashboard from '@/pages/ParentDashboard';
import DrawingStudio from '@/pages/DrawingStudio';
import ABCGame from '@/pages/ABCGame';
import NumberGame from '@/pages/NumberGame';
import QuizGame from '@/pages/QuizGame';
import ShapesGame from '@/pages/ShapesGame';
import Scoreboard from '@/pages/Scoreboard';
import HamburgerMenu from '@/components/HamburgerMenu';
import Footer from '@/components/Footer';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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
      navigateToLogin();
      return null;
    }
  }

  return (
    <LanguageProvider>
      <AgeGroupProvider>
        <Routes>
          {/* Public pages - check if not authenticated */}
          <Route path="/landing" element={<Landing />} />

          {/* App pages - authenticated */}
          <Route path="/" element={<Home />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/games/:category" element={<GamesList />} />
          <Route path="/play/:category/:index" element={<GamePlayer />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          
          {/* Drawing Studio */}
          <Route path="/drawing" element={<DrawingStudio />} />
          
          {/* Legacy games */}
          <Route path="/abc" element={<ABCGame />} />
          <Route path="/numbers" element={<NumberGame />} />
          <Route path="/quiz" element={<QuizGame />} />
          <Route path="/shapes" element={<ShapesGame />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          
          {/* Catch all */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AgeGroupProvider>
    </LanguageProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <HamburgerMenu />
          <AuthenticatedApp />
          <Footer />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
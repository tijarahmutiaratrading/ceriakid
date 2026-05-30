// ─────────────────────────────────────────────────────
// AuthContext — Supabase version
// Replaces lib/AuthContext.jsx
// ─────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Load profile from ck_users table
  const loadProfile = async (sessionUser) => {
    if (!sessionUser) return null;
    const { data: profile } = await supabase
      .from('ck_users')
      .select('*')
      .eq('email', sessionUser.email)
      .single();
    return { ...sessionUser, ...profile };
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const fullUser = await loadProfile(session.user);
        setUser(fullUser);
      }
      setIsLoadingAuth(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const fullUser = await loadProfile(session.user);
        setUser(fullUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      logout,
      navigateToLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
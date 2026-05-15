import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  const isMountedRef = React.useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    const timer = setTimeout(() => checkAppState(), 0);
    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  const safeSet = (setter, value) => {
    if (isMountedRef.current) setter(value);
  };

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      try {
        const headers = { 'X-App-Id': appParams.appId };
        if (appParams.token) headers['Authorization'] = `Bearer ${appParams.token}`;

        const res = await fetch(`/api/apps/public/prod/public-settings/by-id/${appParams.appId}`, { headers });

        if (res.ok) {
          const publicSettings = await res.json();
          setAppPublicSettings(publicSettings);
          if (appParams.token) {
            await checkUserAuth();
          } else {
            setIsLoadingAuth(false);
            setIsAuthenticated(false);
            setAuthChecked(true);
          }
        } else if (res.status === 403) {
          const data = await res.json().catch(() => ({}));
          const reason = data?.extra_data?.reason;
          if (reason === 'auth_required' || reason === 'user_not_registered') {
            setAuthError({ type: reason, message: reason });
          } else {
            setAuthError({ type: reason || 'unknown', message: 'Access denied' });
          }
          setIsLoadingAuth(false);
        } else {
          setIsLoadingAuth(false);
        }
      } catch (appError) {
        console.error('App state check failed:', appError);
        setAuthError({ type: 'unknown', message: appError.message || 'Failed to load app' });
        setIsLoadingAuth(false);
      }

      setIsLoadingPublicSettings(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({ type: 'unknown', message: error.message || 'An unexpected error occurred' });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAuthChecked(true);
      
      // If user auth fails, it might be an expired token
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    base44.auth.redirectToLogin(window.location.href);
  };

  // Refresh auth after login (called after returning from login flow)
  const refreshAuth = async () => {
    await checkAppState();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState,
      refreshAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
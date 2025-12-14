import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useAppStore';
import {
  loginAsGuest,
  loginWithGoogle,
  loginWithApple,
  loginWithFacebook,
  logout,
  fetchCurrentUser,
} from '$redux/reducers/userSlice';
import { authService } from '$services/api/auth.service';

/**
 * useAuth Hook
 * Provides authentication methods and state
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const isGuest = useAppSelector((state) => state.user.isGuest);
  const loading = useAppSelector((state) => state.user.loading);
  const error = useAppSelector((state) => state.user.error);
  const currentUser = useAppSelector((state) => state.user.currentUser);

  const handleGuestLogin = useCallback(async () => {
    try {
      await dispatch(loginAsGuest()).unwrap();
      return true;
    } catch (err) {
      console.error('Guest login failed:', err);
      return false;
    }
  }, [dispatch]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      await dispatch(loginWithGoogle()).unwrap();
      return true;
    } catch (err) {
      console.error('Google login failed:', err);
      return false;
    }
  }, [dispatch]);

  const handleAppleLogin = useCallback(async () => {
    try {
      await dispatch(loginWithApple()).unwrap();
      return true;
    } catch (err) {
      console.error('Apple login failed:', err);
      return false;
    }
  }, [dispatch]);

  const handleFacebookLogin = useCallback(async () => {
    try {
      await dispatch(loginWithFacebook()).unwrap();
      return true;
    } catch (err) {
      console.error('Facebook login failed:', err);
      return false;
    }
  }, [dispatch]);

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      return true;
    } catch (err) {
      console.error('Logout failed:', err);
      return false;
    }
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    const authenticated = await authService.isAuthenticated();
    if (authenticated) {
      try {
        await dispatch(fetchCurrentUser()).unwrap();
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    }
    return authenticated;
  }, [dispatch]);

  const convertGuestToPermanent = useCallback(async (
    authMethod: 'google' | 'apple' | 'facebook' | 'email',
    authData?: any
  ) => {
    try {
      if (!currentUser) {
        throw new Error('No user to convert');
      }

      await authService.convertGuestAccount({
        guestUserId: currentUser.id,
        authMethod,
        ...authData,
      });

      // Refresh user data
      await dispatch(fetchCurrentUser()).unwrap();
      return true;
    } catch (err) {
      console.error('Failed to convert guest account:', err);
      return false;
    }
  }, [dispatch, currentUser]);

  return {
    isAuthenticated,
    isGuest,
    loading,
    error,
    loginAsGuest: handleGuestLogin,
    loginWithGoogle: handleGoogleLogin,
    loginWithApple: handleAppleLogin,
    loginWithFacebook: handleFacebookLogin,
    logout: handleLogout,
    checkAuth,
    convertGuestToPermanent,
  };
};



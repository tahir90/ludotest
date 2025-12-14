import { Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import appleAuth, { AppleAuthRequestOperation, AppleAuthRequestScope } from '@invertase/react-native-apple-authentication';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { ENV } from '$config/env';

/**
 * Social Auth Manager
 * Handles Google, Apple, and Facebook authentication
 */

export interface SocialAuthResult {
  idToken?: string;
  accessToken?: string;
  identityToken?: string;
  authorizationCode?: string;
  email?: string;
  name?: {
    firstName?: string;
    lastName?: string;
  };
}

class SocialAuthManager {
  private static instance: SocialAuthManager | null = null;

  private constructor() {
    this.initializeGoogle();
  }

  static getInstance(): SocialAuthManager {
    if (!SocialAuthManager.instance) {
      SocialAuthManager.instance = new SocialAuthManager();
    }
    return SocialAuthManager.instance;
  }

  /**
   * Initialize Google Sign-In
   */
  private initializeGoogle(): void {
    if (Platform.OS === 'android') {
      GoogleSignin.configure({
        webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
    } else {
      // iOS requires a separate iOS client ID, not the web client ID
      const iosClientId = ENV.GOOGLE_IOS_CLIENT_ID || ENV.GOOGLE_WEB_CLIENT_ID;
      GoogleSignin.configure({
        iosClientId: iosClientId,
        offlineAccess: true,
      });
    }
  }

  /**
   * Google Sign-In
   */
  async signInWithGoogle(): Promise<SocialAuthResult> {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      const tokens = await GoogleSignin.getTokens();
      
      return {
        idToken: userInfo.data?.idToken || tokens.idToken,
        email: userInfo.data?.user.email,
        name: {
          firstName: userInfo.data?.user.givenName,
          lastName: userInfo.data?.user.familyName,
        },
      };
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Sign in was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Sign in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available');
      } else {
        throw new Error(`Google Sign-In failed: ${error.message}`);
      }
    }
  }

  /**
   * Apple Sign-In
   */
  async signInWithApple(): Promise<SocialAuthResult> {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In is only available on iOS');
    }

    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: AppleAuthRequestOperation.LOGIN,
        requestedScopes: [
          AppleAuthRequestScope.EMAIL,
          AppleAuthRequestScope.FULL_NAME,
        ],
      });

      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed: No identity token');
      }

      return {
        identityToken: appleAuthRequestResponse.identityToken,
        authorizationCode: appleAuthRequestResponse.authorizationCode || undefined,
        email: appleAuthRequestResponse.email || undefined,
        name: appleAuthRequestResponse.fullName
          ? {
              firstName: appleAuthRequestResponse.fullName.givenName || undefined,
              lastName: appleAuthRequestResponse.fullName.familyName || undefined,
            }
          : undefined,
      };
    } catch (error: any) {
      if (error.code === appleAuth.Error.CANCELED) {
        throw new Error('Apple Sign-In was cancelled');
      } else {
        throw new Error(`Apple Sign-In failed: ${error.message}`);
      }
    }
  }

  /**
   * Facebook Sign-In
   */
  async signInWithFacebook(): Promise<SocialAuthResult> {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

      if (result.isCancelled) {
        throw new Error('Facebook Sign-In was cancelled');
      }

      if (result.error) {
        throw new Error(`Facebook Sign-In failed: ${result.error}`);
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw new Error('Facebook Sign-In failed: No access token');
      }

      return {
        accessToken: data.accessToken,
      };
    } catch (error: any) {
      throw new Error(`Facebook Sign-In failed: ${error.message}`);
    }
  }

  /**
   * Sign out from Google
   */
  async signOutGoogle(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google Sign-Out error:', error);
    }
  }

  /**
   * Sign out from Facebook
   */
  async signOutFacebook(): Promise<void> {
    try {
      await LoginManager.logOut();
    } catch (error) {
      console.error('Facebook Sign-Out error:', error);
    }
  }
}

export const socialAuthManager = SocialAuthManager.getInstance();
export default socialAuthManager;


